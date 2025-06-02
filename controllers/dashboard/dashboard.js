import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import {
  StudentMarkAnalysis,
  StudentMarkList,
} from "../exams/ruExamController.js";

export const DashboardData = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { role, id } = req.body;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const term = currentMonth <= 4 ? 1 : currentMonth <= 8 ? 2 : 3;

  try {
    if (role === "admin") {
      // 1. Students count
      const { rows: studentRows } = await pool.query(
        "SELECT COUNT(*) AS count FROM students WHERE current_year = $1",
        [currentYear]
      );
      const total_students = parseInt(studentRows[0].count);

      // 2. Teachers count
      const { rows: teacherRows } = await pool.query(
        "SELECT COUNT(*) AS count FROM staff WHERE year = $1",
        [currentYear]
      );
      const total_teachers = parseInt(teacherRows[0].count);

      // 3. Exams count
      let total_exams = 0;
      const forms = [1, 2, 3, 4];

      for (const form of forms) {
        const tableName = `form_${form}_exams`;

        // Sanitize table name by checking allowed values
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
          throw new Error("Invalid table name");
        }

        const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE year = $1 AND term = $2`;

        try {
          const { rows } = await pool.query(query, [currentYear, term]);
          total_exams += parseInt(rows[0].count);
        } catch (err) {
          console.error(`Error querying ${tableName}:`, err.message);
          // Continue with other forms even if one fails
        }
      }

      // 4. Streams count
      const { rows: streamRows } = await pool.query(
        "SELECT COUNT(*) AS count FROM streams WHERE year = $1",
        [currentYear]
      );
      const total_streams = parseInt(streamRows[0].count);

      // 5. Student enrolment by year & gender
      const student_enrolment = {};
      const yearsToQuery = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
      ];

      for (const year of yearsToQuery) {
        const { rows: maleRows } = await pool.query(
          "SELECT COUNT(*) AS count FROM students WHERE current_year = $1 AND sex = $2",
          [year, "M"]
        );
        const { rows: femaleRows } = await pool.query(
          "SELECT COUNT(*) AS count FROM students WHERE current_year = $1 AND sex = $2",
          [year, "F"]
        );

        student_enrolment[year] = {
          M: parseInt(maleRows[0].count),
          F: parseInt(femaleRows[0].count),
        };
      }

      // 6. Get exam_name
      let exam_name = null;
      let form = null;

      try {
        const { rows: form4Exams } = await pool.query(
          "SELECT exam_name FROM form_4_exams WHERE year = $1 LIMIT 1",
          [currentYear]
        );

        if (form4Exams.length > 0) {
          exam_name = form4Exams[0].exam_name;
          form = 4;
        } else {
          for (let f = 1; f <= 3; f++) {
            const { rows } = await pool.query(
              `SELECT exam_name FROM form_${f}_exams WHERE year = $1 LIMIT 1`,
              [currentYear]
            );
            if (rows.length > 0) {
              exam_name = rows[0].exam_name;
              form = f;
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching exam_name:", err.message);
      }

      // 7. Subject averages
      let subject_average = {};

      if (exam_name && form) {
        try {
          const mockReq = {
            body: {
              form,
              formula: "average",
              yearValue: currentYear,
              exams: {
                exam_1: {
                  alias: "Open",
                  name: exam_name,
                  outof: "100",
                },
              },
            },
          };

          const mockRes = {
            json: (data) => data,
          };

          const marklistData = await StudentMarkAnalysis(
            mockReq,
            mockRes,
            next
          );

          (marklistData?.performanceData || []).forEach((subject) => {
            subject_average[subject.init] = subject.overallAvg;
          });
        } catch (err) {
          console.error("Error in StudentMarkAnalysis:", err.message);
          subject_average = {};
        }
      }

      // 8. Combine all results
      const dashboardData = {
        total_students,
        total_teachers,
        total_exams,
        total_streams,
        student_enrolment,
        subject_average,
      };

      return res.status(200).json(dashboardData);
    } else if (role === "teacher") {
      if (!id) {
        return next(createError(400, "Teacher ID is required"));
      }

      // 1. Calculate workload percentage
      let teacherSubjectsCount = 0;
      let totalSubjectsCount = 0;
      const subjectTables = [
        "subjectteachers_form_1",
        "subjectteachers_form_2",
        "subjectteachers_form_3",
        "subjectteachers_form_4",
      ];

      for (const table of subjectTables) {
        try {
          const { rows: teacherRows } = await pool.query(
            `SELECT COUNT(*) AS count FROM ${table} WHERE year = $1 AND teacher_id = $2`,
            [currentYear, id]
          );
          teacherSubjectsCount += parseInt(teacherRows[0].count);

          const { rows: totalRows } = await pool.query(
            `SELECT COUNT(*) AS count FROM ${table} WHERE year = $1`,
            [currentYear]
          );
          totalSubjectsCount += parseInt(totalRows[0].count);
        } catch (err) {
          console.error(`Error querying ${table}:`, err.message);
        }
      }

      const workload =
        totalSubjectsCount > 0
          ? Math.round((teacherSubjectsCount / totalSubjectsCount) * 100)
          : 0;

      // 2. Get classes/streams count
      let total_classes = 0;
      try {
        const { rows: streamRows } = await pool.query(
          "SELECT COUNT(*) AS count FROM streams WHERE year = $1 AND teacher_id = $2",
          [currentYear, id]
        );
        total_classes = parseInt(streamRows[0].count);
      } catch (err) {
        console.error("Error fetching streams count:", err.message);
      }

      // 3. Get exams count
      let total_exams = 0;
      const examTables = [
        "form_1_exams",
        "form_2_exams",
        "form_3_exams",
        "form_4_exams",
      ];

      for (const table of examTables) {
        try {
          const { rows } = await pool.query(
            `SELECT COUNT(*) AS count FROM ${table} WHERE year = $1 AND term = $2`,
            [currentYear, term]
          );
          total_exams += parseInt(rows[0].count);
        } catch (err) {
          console.error(`Error querying ${table}:`, err.message);
        }
      }

      // 4. Get stream performance data
      const stream_performance = {};
      const forms = [1, 2, 3, 4];

      for (const form of forms) {
        try {
          // Get subjects taught by this teacher for this form
          const { rows: subjectRows } = await pool.query(
            `SELECT subject_id FROM subjectteachers_form_${form} WHERE year = $1 AND teacher_id = $2 LIMIT 2`,
            [currentYear, id]
          );

          if (subjectRows.length > 0) {
            // Get a random exam for this form
            const { rows: examRows } = await pool.query(
              `SELECT exam_name FROM form_${form}_exams WHERE year = $1 LIMIT 1`,
              [currentYear]
            );

            if (examRows.length > 0) {
              const exam_name = examRows[0].exam_name;
              const mockReq = {
                body: {
                  form,
                  formula: "average",
                  yearValue: currentYear,
                  exams: {
                    exam_1: {
                      alias: "Open",
                      name: exam_name,
                      outof: "100",
                    },
                  },
                },
              };

              const mockRes = {
                json: (data) => data,
              };

              const marklistData = await StudentMarkAnalysis(
                mockReq,
                mockRes,
                next
              );

              if (marklistData?.performanceData) {
                let sumAvg = 0;
                let count = 0;
                let otherSubjectsSum = 0;
                let otherSubjectsCount = 0;

                // First calculate average of other subjects (not taught by this teacher)
                marklistData.performanceData.forEach((subject) => {
                  const isTeachersSubject = subjectRows.some((row) => {
                    console.log(subject);
                    parseInt(row.subject_id) === parseInt(subject.code);
                  });
                  console.log(isTeachersSubject);
                  if (!isTeachersSubject) {
                    otherSubjectsSum += subject.overallAvg;
                    otherSubjectsCount++;
                  }
                });

                const otherSubjectsAvg =
                  otherSubjectsCount > 0
                    ? otherSubjectsSum / otherSubjectsCount
                    : 0;

                // Get performance for teacher's subjects
                subjectRows.forEach(({ subject_id }) => {
                  const subject = marklistData.performanceData.find(
                    (s) => parseInt(s.code) === parseInt(subject_id)
                  );
                  if (subject) {
                    stream_performance[form] = stream_performance[form] || {};
                    stream_performance[form][subject.init] = subject.overallAvg;
                    sumAvg += subject.overallAvg;
                    count++;
                  }
                });

                // Calculate average including other subjects
                if (count > 0 || otherSubjectsCount > 0) {
                  const totalSum = sumAvg + otherSubjectsSum;
                  const totalCount = count + otherSubjectsCount;
                  stream_performance[form].AVG =
                    Math.round((totalSum / totalCount) * 100) / 100;
                }
              }
            }
          }
        } catch (err) {
          console.error(
            `Error processing form ${form} performance:`,
            err.message
          );
        }
      }

      // 5. Get top and weak students
      const top_weak = {};
      const examNames = [];

      // Get up to 2 exam names
      for (const form of forms) {
        try {
          const { rows } = await pool.query(
            `SELECT exam_name FROM form_${form}_exams WHERE year = $1 LIMIT 1`,
            [currentYear]
          );
          if (rows.length > 0 && examNames.length < 2) {
            examNames.push(rows[0].exam_name);
          }
        } catch (err) {
          console.error(
            `Error getting exam name for form ${form}:`,
            err.message
          );
        }
      }

      for (const examName of examNames) {
        try {
          // Get subjects taught by teacher
          const subjectIds = [];
          for (const form of forms) {
            const { rows } = await pool.query(
              `SELECT subject_id FROM subjectteachers_form_${form} WHERE year = $1 AND teacher_id = $2 LIMIT 2`,
              [currentYear, id]
            );
            rows.forEach((row) => subjectIds.push(row.subject_id));
          }

          // Get top and weak students for each subject
          for (const subjectId of subjectIds.slice(0, 2)) {
            try {
              // Top students - join with students table to get full name
              const { rows: topRows } = await pool.query(
                `SELECT s.id, CONCAT(s.fname, ' ', s.lname) AS name, e."${subjectId}"
                 FROM ${examName.replace(/\s+/g, "_").toLowerCase()} e
                 JOIN students s ON e.id = s.id
                 ORDER BY e."${subjectId}" DESC LIMIT 2`
              );

              // Weak students - join with students table to get full name
              const { rows: weakRows } = await pool.query(
                `SELECT s.id, CONCAT(s.fname, ' ', s.lname) AS name, e."${subjectId}"
                 FROM ${examName.replace(/\s+/g, "_").toLowerCase()} e
                 JOIN students s ON e.id = s.id
                 ORDER BY e."${subjectId}" ASC LIMIT 2`
              );

              if (!top_weak[examName]) {
                top_weak[examName] = {};
              }

              // Get subject code for display
              // const { rows: subjectRows } = await pool.query(
              //   "SELECT code FROM subjects WHERE id = $1",
              //   [subjectId]
              // );
              // const subjectCode = subjectRows[0]?.code || subjectId;

              top_weak[examName][subjectId] = {
                top: topRows,
                weak: weakRows,
              };
            } catch (err) {
              console.error(
                `Error querying exam data for subject ${subjectId}:`,
                err.message
              );
            }
          }
        } catch (err) {
          console.error(`Error processing exam ${examName}:`, err.message);
        }
      }

      // Combine all teacher data
      const teacherDashboardData = {
        total_subjects: teacherSubjectsCount,
        total_classes,
        workload,
        total_exams,
        stream_performance,
        top_weak,
      };

      return res.status(200).json(teacherDashboardData);
    } else if (role === "student") {
      if (!id) return next(createError(400, "Student ID is required"));

      // Get student info
      const { rows: studentRows } = await pool.query(
        "SELECT year_of_enrolment, current_form FROM students WHERE id = $1",
        [id]
      );

      if (studentRows.length === 0) {
        return next(createError(404, "Student not found"));
      }

      const { year_of_enrolment, current_form } = studentRows[0];
      const forms = Array.from({ length: current_form }, (_, i) => i + 1);

      const performance_trend = {};
      let total_exams = 0;
      const gradePoints = {
        E: 1,
        "D-": 2,
        D: 3,
        "D+": 4,
        "C-": 5,
        C: 6,
        "C+": 7,
        "B-": 8,
        B: 9,
        "B+": 10,
        "A-": 11,
        A: 12,
      };

      // Modified StudentMarkList wrapper
      const getStudentMarks = async (reqParams) => {
        try {
          // Create a custom response handler
          // let responseData;
          // const mockRes = {
          //   json: (data) => {
          //     responseData = data;
          //   },
          //   status: () => mockRes,
          // };

          // // Create a no-op next function
          // const mockNext = () => {};

          // const resp =
          return await StudentMarkList(reqParams);
          // return responseData;
        } catch (err) {
          console.error("Error in StudentMarkList:", err);
          return null;
        }
      };

      // Get performance trend
      for (const form of forms) {
        const { rows: examRows } = await pool.query(
          `SELECT exam_name, year FROM form_${form}_exams 
           WHERE year BETWEEN $1 AND $2`,
          [year_of_enrolment, currentYear]
        );

        for (const exam of examRows) {
          const result = await getStudentMarks({
            body: {
              form,
              yearValue: exam.year,
              formula: "self",
              exams: {
                exam_1: {
                  alias: "Open",
                  name: exam.exam_name,
                  outof: "100",
                },
              },
            },
            user: { id },
          });

          console.log(result);

          if (result?.formattedStudents) {
            const studentData = result.formattedStudents.find(
              (s) => s.id === id
            );
            if (studentData?.grade) {
              performance_trend[exam.exam_name] =
                gradePoints[studentData.grade] || 0;
              total_exams++;
            }
          }
        }
      }

      // Get latest results
      let latest_results = null;
      let recent_grade = null;
      let stream_position = null;
      let overal_position = null;

      const { rows: recentExamRows } = await pool.query(
        `SELECT exam_name, year FROM form_${current_form}_exams 
         WHERE year = $1 ORDER BY created_at DESC LIMIT 1`,
        [currentYear]
      );

      if (recentExamRows.length > 0) {
        const recentExam = recentExamRows[0];
        const result = await getStudentMarks({
          body: {
            form: current_form,
            yearValue: recentExam.year,
            formula: "self",
            exams: {
              exam_1: {
                alias: "Open",
                name: recentExam.exam_name,
                outof: "100",
              },
            },
          },
          user: { id },
        });

        if (result?.formattedStudents) {
          const studentData = result.formattedStudents.find((s) => s.id === id);
          if (studentData) {
            latest_results = studentData;
            recent_grade = studentData.grade;
            stream_position = studentData.stream_rank;
            overal_position = studentData.overal_rank;
          }
        }
      }

      return res.status(200).json({
        recent_grade,
        stream_position,
        overal_position,
        total_exams,
        performance_trend,
        latest_results,
      });
    } else {
      return next(createError(403, "Forbidden: Invalid role"));
    }
  } catch (err) {
    console.error("DashboardData error:", err.message);
    next(err);
  }
};

// import pool from "../../config/db_connection.js";
// import { createError } from "../../utils/ErrorHandler.js";
// import { StudentMarkList } from "../exams/ruExamController.js";

// export const DashboardData = async (req, res, next) => {
//   if (!req.is("application/json")) {
//     return next(
//       createError(415, "Unsupported Media Type: Expected application/json")
//     );
//   }

//   const { role, id } = req.body;
//   const currentDate = new Date();
//   const currentYear = currentDate.getFullYear();

//   try {
//     if (role === "student") {
//       if (!id) return next(createError(400, "Student ID is required"));

//       // Get student info
//       const { rows: studentRows } = await pool.query(
//         "SELECT year_of_enrolment, current_form FROM students WHERE id = $1",
//         [id]
//       );

//       if (studentRows.length === 0) {
//         return next(createError(404, "Student not found"));
//       }

//       const { year_of_enrolment, current_form } = studentRows[0];
//       const forms = Array.from({ length: current_form }, (_, i) => i + 1);

//       const performance_trend = {};
//       let total_exams = 0;
//       const gradePoints = {
//         E: 1,
//         "D-": 2,
//         D: 3,
//         "D+": 4,
//         "C-": 5,
//         C: 6,
//         "C+": 7,
//         "B-": 8,
//         B: 9,
//         "B+": 10,
//         "A-": 11,
//         A: 12,
//       };

//       // Modified StudentMarkList wrapper
//       const getStudentMarks = async (reqParams) => {
//         try {
//           // Create a custom response handler
//           // let responseData;
//           // const mockRes = {
//           //   json: (data) => {
//           //     responseData = data;
//           //   },
//           //   status: () => mockRes,
//           // };

//           // // Create a no-op next function
//           // const mockNext = () => {};

//           // const resp =
//           return await StudentMarkList(reqParams);
//           // return responseData;
//         } catch (err) {
//           console.error("Error in StudentMarkList:", err);
//           return null;
//         }
//       };

//       // Get performance trend
//       for (const form of forms) {
//         const { rows: examRows } = await pool.query(
//           `SELECT exam_name, year FROM form_${form}_exams 
//            WHERE year BETWEEN $1 AND $2`,
//           [year_of_enrolment, currentYear]
//         );

//         for (const exam of examRows) {
//           const result = await getStudentMarks({
//             body: {
//               form,
//               yearValue: exam.year,
//               formula: "self",
//               exams: {
//                 exam_1: {
//                   alias: "Open",
//                   name: exam.exam_name,
//                   outof: "100",
//                 },
//               },
//             },
//             user: { id },
//           });

//           console.log(result);

//           if (result?.formattedStudents) {
//             const studentData = result.formattedStudents.find(
//               (s) => s.id === id
//             );
//             if (studentData?.grade) {
//               performance_trend[exam.exam_name] =
//                 gradePoints[studentData.grade] || 0;
//               total_exams++;
//             }
//           }
//         }
//       }

//       // Get latest results
//       let latest_results = null;
//       let recent_grade = null;
//       let stream_position = null;
//       let overal_position = null;

//       const { rows: recentExamRows } = await pool.query(
//         `SELECT exam_name, year FROM form_${current_form}_exams 
//          WHERE year = $1 ORDER BY created_at DESC LIMIT 1`,
//         [currentYear]
//       );

//       if (recentExamRows.length > 0) {
//         const recentExam = recentExamRows[0];
//         const result = await getStudentMarks({
//           body: {
//             form: current_form,
//             yearValue: recentExam.year,
//             formula: "self",
//             exams: {
//               exam_1: {
//                 alias: "Open",
//                 name: recentExam.exam_name,
//                 outof: "100",
//               },
//             },
//           },
//           user: { id },
//         });

//         if (result?.formattedStudents) {
//           const studentData = result.formattedStudents.find((s) => s.id === id);
//           if (studentData) {
//             latest_results = studentData;
//             recent_grade = studentData.grade;
//             stream_position = studentData.stream_rank;
//             overal_position = studentData.overal_rank;
//           }
//         }
//       }

//       return res.status(200).json({
//         recent_grade,
//         stream_position,
//         overal_position,
//         total_exams,
//         performance_trend,
//         latest_results,
//       });
//     } else {
//       return next(createError(403, "Forbidden: Invalid role"));
//     }
//   } catch (err) {
//     console.error("DashboardData error:", err.message);
//     return next(err);
//   }
// };
