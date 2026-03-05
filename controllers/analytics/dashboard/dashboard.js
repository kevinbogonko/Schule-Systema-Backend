import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
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

  const { role, id, isCBC = true } = req.body;
  console.log(role, id, isCBC);
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
      const total_students = parseInt(studentRows[0].count, 10) || 0;
      // console.log(total_students);

      // 2. Teachers count
      const { rows: teacherRows } = await pool.query(
        "SELECT COUNT(*) AS count FROM staff WHERE year = $1",
        [currentYear]
      );
      const total_teachers = parseInt(teacherRows[0].count, 10) || 0;

      // 3. Exams count
      let total_exams = 0;
      // use the specified form candidates depending on isCBC and pick only one form (first with exams)
      const examFormCandidates = isCBC ? [0, 3, 6, 9, 12] : [21, 22];
      const examTable = "exams";

      // validate table name (simple check)
      if (!/^[a-zA-Z0-9_]+$/.test(examTable)) {
        throw new Error("Invalid exam table name");
      }

      let selectedExamForm = null;
      for (const candidateForm of examFormCandidates) {
        try {
          const query = `SELECT COUNT(*) AS count FROM ${examTable} WHERE year = $1 AND form = $2 AND term = $3`;
          const { rows } = await pool.query(query, [
            currentYear,
            candidateForm,
            term,
          ]);
          const count = parseInt(rows[0].count, 10) || 0;
          if (count > 0) {
            total_exams = count;
            selectedExamForm = candidateForm;
            break; // use only one form (the first that has exams)
          }
        } catch (err) {
          console.error(
            `Error querying ${examTable} for form ${candidateForm}:`,
            err.message
          );
          // continue to next candidate form
        }
      }
      // if none of the candidate forms had exams, total_exams remains 0

      // 4. Streams count
      const { rows: streamRows } = await pool.query(
        "SELECT COUNT(*) AS count FROM streams WHERE year = $1",
        [currentYear]
      );
      const total_streams = parseInt(streamRows[0].count, 10) || 0;

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
          M: parseInt(maleRows[0].count, 10) || 0,
          F: parseInt(femaleRows[0].count, 10) || 0,
        };
      }

      // 6. Get exam_name
      let exam_name = null;
      let exam_id = null;
      let exam_form_for_name = null;
      try {
        // use same candidate forms as above: [6,9] (isCBC true) or [21,22] (isCBC false)
        for (const candidateForm of examFormCandidates) {
          try {
            const { rows } = await pool.query(
              `SELECT id, exam_name FROM ${examTable} WHERE year = $1 AND form = $2 ORDER BY created_at DESC LIMIT 1`,
              [currentYear, candidateForm]
            );
            if (rows.length > 0) {
              exam_name = rows[0].exam_name;
              exam_id = rows[0].id;
              exam_form_for_name = candidateForm;
              break;
            }
          } catch (err) {
            console.error(
              `Error fetching exam_name from ${examTable} for form ${candidateForm}:`,
              err.message
            );
            // try next candidate form
          }
        }
      } catch (err) {
        console.error("Error fetching exam_name (outer):", err.message);
      }

      // 7. Subject averages
      let subject_average = {};
      let form

      if (exam_id && exam_name && exam_form_for_name != null) {
        try {
          const mockReq = {
            body: {
              form: exam_form_for_name,
              formula: "average",
              yearValue: currentYear,
              exams: {
                exam_1: {
                  alias: exam_name,
                  name: exam_id,
                  outof: "100",
                },
              },
              year: currentYear,
              term: term,
              examname: exam_name,
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
          // console.log(marklistData?.performanceData)

          (marklistData?.performanceData || []).forEach((subject) => {
            subject_average[subject.init] = subject.overallAvg;
          });

        form = marklistData?.form;

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
        form
      };

      return res.status(200).json(dashboardData);
    } else if (role === "teacher") {
      if (!id) {
        return next(createError(400, "Teacher ID is required"));
      }

      // 1. Calculate workload percentage using single subjectteachers table
      let teacherSubjectsCount = 0;
      let totalSubjectsCount = 0;
      const subjectTable = "subjectteachers";

      // validate table name
      if (!/^[a-zA-Z0-9_]+$/.test(subjectTable)) {
        throw new Error("Invalid subject table name");
      }

      try {
        const { rows: tRows } = await pool.query(
          `SELECT COUNT(*) AS count FROM ${subjectTable} WHERE year = $1 AND teacher_id = $2`,
          [currentYear, id]
        );
        teacherSubjectsCount = parseInt(tRows[0].count, 10) || 0;
      } catch (err) {
        console.error(
          `Error querying ${subjectTable} for teacher count:`,
          err.message
        );
      }

      try {
        const { rows: totRows } = await pool.query(
          `SELECT COUNT(*) AS count FROM ${subjectTable} WHERE year = $1`,
          [currentYear]
        );
        totalSubjectsCount = parseInt(totRows[0].count, 10) || 0;
      } catch (err) {
        console.error(
          `Error querying ${subjectTable} for total subjects:`,
          err.message
        );
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
        total_classes = parseInt(streamRows[0].count, 10) || 0;
      } catch (err) {
        console.error("Error fetching streams count:", err.message);
      }

      // 3. Get exams count (teacher) - use same candidate forms logic as admin and examTable
      let total_exams = 0;
      const examTable = "exams";
      const examFormCandidates = isCBC ? [6, 9] : [21, 22];
      let selectedExamFormForTeacher = null;

      if (!/^[a-zA-Z0-9_]+$/.test(examTable)) {
        throw new Error("Invalid exam table name");
      }

      for (const candidateForm of examFormCandidates) {
        try {
          const { rows } = await pool.query(
            `SELECT COUNT(*) AS count FROM ${examTable} WHERE year = $1 AND form = $2 AND term = $3`,
            [currentYear, candidateForm, term]
          );
          const count = parseInt(rows[0].count, 10) || 0;
          if (count > 0) {
            total_exams = count;
            selectedExamFormForTeacher = candidateForm;
            break;
          }
        } catch (err) {
          console.error(
            `Error querying ${examTable} for form ${candidateForm}:`,
            err.message
          );
        }
      }

      // 4. Get stream performance data
      const stream_performance = {};
      // use a set of forms to inspect performance - for display we will use some sensible forms
      const formsToCheck = [1, 2, 3, 4];

      for (const formCandidate of formsToCheck) {
        try {
          // Get subjects taught by this teacher for this form (limit 2)
          const { rows: subjectRows } = await pool.query(
            `SELECT subject_id FROM subjectteachers WHERE year = $1 AND teacher_id = $2 AND form = $3 LIMIT 2`,
            [currentYear, id, formCandidate]
          );

          if (subjectRows.length > 0) {
            // Get a random (latest) exam for this form
            const { rows: examRows } = await pool.query(
              `SELECT exam_name FROM ${examTable} WHERE year = $1 AND form = $2 ORDER BY created_at DESC LIMIT 1`,
              [currentYear, formCandidate]
            );

            if (examRows.length > 0) {
              const exam_name = examRows[0].exam_name;
              const mockReq = {
                body: {
                  form: formCandidate,
                  formula: "average",
                  yearValue: currentYear,
                  exams: {
                    exam_1: {
                      alias: exam_name,
                      name: exam_name,
                      outof: "100",
                    },
                  },
                  year: currentYear,
                  term: term,
                  examname: exam_name,
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
                    // ensure we return the comparison result
                    return (
                      parseInt(row.subject_id, 10) ===
                      parseInt(subject.code, 10)
                    );
                  });

                  if (!isTeachersSubject) {
                    otherSubjectsSum += subject.overallAvg || 0;
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
                    (s) => parseInt(s.code, 10) === parseInt(subject_id, 10)
                  );
                  if (subject) {
                    stream_performance[formCandidate] =
                      stream_performance[formCandidate] || {};
                    stream_performance[formCandidate][subject.init] =
                      subject.overallAvg;
                    sumAvg += subject.overallAvg || 0;
                    count++;
                  }
                });

                // Calculate average including other subjects (if any)
                if (count > 0 || otherSubjectsCount > 0) {
                  const totalSum = sumAvg + otherSubjectsSum;
                  const totalCount = count + otherSubjectsCount;
                  stream_performance[formCandidate] =
                    stream_performance[formCandidate] || {};
                  stream_performance[formCandidate].AVG =
                    totalCount > 0
                      ? Math.round((totalSum / totalCount) * 100) / 100
                      : 0;
                }
              }
            }
          }
        } catch (err) {
          console.error(
            `Error processing form ${formCandidate} performance:`,
            err.message
          );
        }
      }

      // 5. Get top and weak students
      const top_weak = {};
      const examNames = [];

      // Get up to 2 exam names - prefer formsToCheck, but can include selectedExamFormForTeacher if found
      const formsForExamNames = [
        ...new Set(
          [...formsToCheck, selectedExamFormForTeacher].filter(Boolean)
        ),
      ];

      for (const formCandidate of formsForExamNames) {
        try {
          const { rows } = await pool.query(
            `SELECT exam_name FROM ${examTable} WHERE year = $1 AND form = $2 ORDER BY created_at DESC LIMIT 1`,
            [currentYear, formCandidate]
          );
          if (rows.length > 0 && examNames.length < 2) {
            examNames.push(rows[0].exam_name);
          }
        } catch (err) {
          console.error(
            `Error getting exam name for form ${formCandidate}:`,
            err.message
          );
        }
      }

      for (const examName of examNames) {
        try {
          // Get subjects taught by teacher (across forms) - limit to 2 subjects total
          const subjectIds = [];
          const { rows: subs } = await pool.query(
            `SELECT subject_id FROM subjectteachers WHERE year = $1 AND teacher_id = $2 LIMIT 2`,
            [currentYear, id]
          );
          subs.forEach((r) => subjectIds.push(r.subject_id));

          // Get top and weak students for each subject
          for (const subjectId of subjectIds.slice(0, 2)) {
            try {
              // Sanitize table name derived from examName (simple transformation)
              const examTableName = examName.replace(/\s+/g, "_").toLowerCase();
              if (!/^[a-zA-Z0-9_]+$/.test(examTableName)) {
                console.error(
                  `Invalid dynamic exam table name: ${examTableName}`
                );
                continue;
              }

              // Top students - join with students table to get full name
              const { rows: topRows } = await pool.query(
                `SELECT s.id, CONCAT(s.fname, ' ', s.lname) AS name, e."${subjectId}"
                 FROM ${examTableName} e
                 JOIN students s ON e.id = s.id
                 ORDER BY e."${subjectId}" DESC LIMIT 2`
              );

              // Weak students - join with students table to get full name
              const { rows: weakRows } = await pool.query(
                `SELECT s.id, CONCAT(s.fname, ' ', s.lname) AS name, e."${subjectId}"
                 FROM ${examTableName} e
                 JOIN students s ON e.id = s.id
                 ORDER BY e."${subjectId}" ASC LIMIT 2`
              );

              if (!top_weak[examName]) {
                top_weak[examName] = {};
              }

              top_weak[examName][subjectId] = {
                top: topRows,
                weak: weakRows,
              };
            } catch (err) {
              console.error(
                `Error querying exam data for subject ${subjectId} (exam ${examName}):`,
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
      const gradePoints = isCBC
        ? {
            BE2: 1,
            BE1: 2,
            AE2: 3,
            AE1: 4,
            ME2: 5,
            ME1: 6,
            EE2: 7,
            EE1: 8,
          }
        : {
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
          // assume StudentMarkList accepts req-like object and returns result
          return await StudentMarkList(reqParams);
        } catch (err) {
          console.error("Error in StudentMarkList:", err);
          return null;
        }
      };

      // Get performance trend
      for (const form of forms) {
        // Query exams from the unified exams table (not form_x tables)
        const { rows: examRows } = await pool.query(
          `SELECT id, exam_name, year FROM exams WHERE form = $1 AND year BETWEEN $2 AND $3 ORDER BY year`,
          [form, year_of_enrolment, currentYear]
        );

        for (const exam of examRows) {
          const result = await getStudentMarks({
            body: {
              form,
              yearValue: exam.year,
              formula: "self",
              exams: {
                exam_1: {
                  alias: exam.exam_name,
                  name: exam.id,
                  outof: "100",
                },
              },
              year: currentYear,
              term: term,
              examname: exam.exam_name,
            },
            user: { id },
          });

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
        `SELECT id, exam_name, year, form FROM exams
         WHERE year = $1 AND form = $2
         ORDER BY created_at DESC LIMIT 1`,
        [currentYear, current_form]
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
                alias: recentExam.exam_name,
                name: recentExam.id,
                outof: "100",
              },
            },
            year: currentYear,
            term: term,
            examname: recentExam.exam_name,
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
        form : current_form
      });
    } else if (role === "sudo") {
      return res.status(200).json({message : 'SUDO'})
    }else{
      return next(createError(403, "Forbidden: Invalid role"));
    }
  } catch (err) {
    // console.log(err)
    console.error("DashboardData error:", err.message);
    next(err);
  }
};
