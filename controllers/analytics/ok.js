import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";

export const studentReportMarks = async (req, res, next) => {
  const { form, exams, formula } = req.body;

  try {
    if (!form || !exams || !formula) {
      return next(createError(400, "Required fields are missing!"));
    }

    const sanitizedForm = sanitizeStringVariables(form);
    if (typeof exams !== "object" || exams === null) {
      return next(createError(400, "Exams must be an object"));
    }

    const validPattern = /^[a-z0-9_]+$/i;
    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;

    // Points scale for grading
    const pointsScale = {
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

    // Grade point scale for AG grade (Forms 3 & 4)
    const gradePointScale = {
      E: { min: 1, max: 7 },
      "D-": { min: 8, max: 14 },
      D: { min: 15, max: 21 },
      "D+": { min: 22, max: 28 },
      "C-": { min: 29, max: 35 },
      C: { min: 36, max: 42 },
      "C+": { min: 43, max: 49 },
      "B-": { min: 50, max: 56 },
      B: { min: 57, max: 63 },
      "B+": { min: 64, max: 70 },
      "A-": { min: 71, max: 77 },
      A: { min: 78, max: 84 },
    };

    // Define subject groups
    const group_1 = [101, 102, 121, 122]; // Languages
    const group_2 = [231, 232, 233, 236, 237]; // Sciences
    const group_3 = [311, 312, 313, 314, 315]; // Humanities
    const group_4 = [
      441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 501, 502, 503, 504,
      511,
    ]; // Technicals

    // Fetch school particulars
    const particularsRes = await pool.query(
      "SELECT * FROM particulars WHERE id = 119"
    );
    const particulars = particularsRes.rows[0] || {
      schoolname: "KIMARU SCHOOLS",
      motto: "To the Uttermost",
      phone: "254743917360",
      address: "43844 - 00100 Nairobi",
      email: "info@kimaruschools.com",
      website: null,
      logo_path: null,
    };

    // Fetch staff for instructor names
    const staffRes = await pool.query(
      'SELECT id, CONCAT(title, " ", fname, " ", lname) as name FROM staff'
    );
    console.log(staffRes)
    const staffCollection = staffRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.name,
    }));

    // Fetch comments for remarks
    const commentsRes = await pool.query("SELECT * FROM comments");
    const commentsCollection = commentsRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.comment,
    }));

    // Fetch principal remarks
    const principalRemarkRes = await pool.query(
      "SELECT * FROM principal_remark"
    );
    const principalRemarkCollection = principalRemarkRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.comment,
    }));

    // Fetch class teacher remarks
    const classteacherRemarkRes = await pool.query(
      "SELECT * FROM classteacher_remark"
    );
    const classteacherRemarkCollection = classteacherRemarkRes.rows.map(
      (row) => ({
        value: parseInt(row.id),
        label: row.comment,
      })
    );

    // Fetch active subjects
    const subjectTable = `subjects_form_${sanitizedForm}`;
    const subjectsRes = await pool.query(
      `SELECT id, name FROM ${subjectTable} WHERE status = 1`
    );
    const subjects = subjectsRes.rows;
    const subjectMap = new Map(subjects.map((sub) => [sub.id, sub]));

    // Categorize active subjects into groups
    const active_group_1 = group_1.filter((id) =>
      subjects.some((sub) => sub.id === id)
    );
    const active_group_2 = group_2.filter((id) =>
      subjects.some((sub) => sub.id === id)
    );
    const active_group_3 = group_3.filter((id) =>
      subjects.some((sub) => sub.id === id)
    );
    const active_group_4 = group_4.filter((id) =>
      subjects.some((sub) => sub.id === id)
    );

    const examKeys = Object.keys(exams);
    const examTables = {};
    const examOutofs = {};
    const examAliases = {};

    // Validate and prepare exams
    for (let key of examKeys) {
      const { name, alias, outof } = exams[key];

      if (!name || !alias || !outof || !validPattern.test(name)) {
        return next(createError(400, "Invalid exam inputs!"));
      }
      if (sqlInjectionPattern.test(name)) {
        return next(createError(400, "Possible SQL injection in exam name!"));
      }

      // Check if table exists
      const examTableRes = await pool.query(
        `
        SELECT to_regclass($1) as exists
      `,
        [name]
      );

      if (!examTableRes.rows[0].exists) {
        return next(createError(400, `Exam table ${name} does not exist!`));
      }

      examTables[key] = name;
      examOutofs[key] = parseFloat(outof);
      examAliases[key] = alias;
    }

    // Get grading criteria from one of the exam tables
    const firstExamTable = examTables[examKeys[0]];
    const gradingTable = `grading_${firstExamTable}`;

    // Check if grading table exists
    const gradingTableRes = await pool.query(
      `
      SELECT to_regclass($1) as exists
    `,
      [gradingTable]
    );

    if (!gradingTableRes.rows[0].exists) {
      return next(
        createError(400, `Grading table ${gradingTable} does not exist!`)
      );
    }

    // Get grading criteria for all active subjects
    const gradingRes = await pool.query(
      `
      SELECT * FROM ${gradingTable} WHERE id = ANY($1)
    `,
      [subjects.map((sub) => sub.id)]
    );

    const gradingMap = new Map();
    gradingRes.rows.forEach((row) => {
      gradingMap.set(row.id, {
        E: { min: row.e0, max: row.e1 },
        "D-": { min: row.dm0, max: row.dm1 },
        D: { min: row.d0, max: row.d1 },
        "D+": { min: row.dp0, max: row.dp1 },
        "C-": { min: row.cm0, max: row.cm1 },
        C: { min: row.c0, max: row.c1 },
        "C+": { min: row.cp0, max: row.cp1 },
        "B-": { min: row.bm0, max: row.bm1 },
        B: { min: row.b0, max: row.b1 },
        "B+": { min: row.bp0, max: row.bp1 },
        "A-": { min: row.am0, max: row.am1 },
        A: { min: row.a0, max: row.a1 },
      });
    });

    // Function to determine grade and points
    const getGradeAndPoints = (mark, subjectId) => {
      if (mark === null || mark === undefined)
        return { grade: "N/A", points: 0 };

      const gradeRanges = gradingMap.get(subjectId);
      if (!gradeRanges) return { grade: "N/A", points: 0 };

      for (const [grade, range] of Object.entries(gradeRanges)) {
        if (mark >= range.min && mark <= range.max) {
          return { grade, points: pointsScale[grade] };
        }
      }

      return { grade: "N/A", points: 0 };
    };

    // Collect active marks from all exam tables
    const studentsTable = `students_form_${sanitizedForm}`;
    const studentMap = new Map();

    // First get all students with their KCPE marks and stream
    const studentsRes = await pool.query(`
      SELECT id, fname || ' ' || lname AS name, kcpe_marks, stream_id 
      FROM ${studentsTable}
    `);

    studentsRes.rows.forEach((student) => {
      studentMap.set(student.id, {
        id: student.id,
        name: student.name,
        kcpe_marks: student.kcpe_marks,
        kcpe_grade: getKcpeGrade(student.kcpe_marks),
        stream_id: student.stream_id,
        results: [],
        totalMarks: 0,
        totalPoints: 0,
        includedSubjects: [],
      });
    });

    // Helper function to determine KCPE grade
    function getKcpeGrade(marks) {
      if (marks >= 400) return "A";
      if (marks >= 350) return "A-";
      if (marks >= 300) return "B+";
      if (marks >= 250) return "B";
      if (marks >= 200) return "B-";
      if (marks >= 150) return "C+";
      if (marks >= 100) return "C";
      if (marks >= 50) return "C-";
      return "D";
    }

    // Process each exam table
    for (const [key, tableName] of Object.entries(examTables)) {
      const examRes = await pool.query(`
        SELECT e.* FROM ${tableName} e
        JOIN ${studentsTable} s ON s.id = e.id
      `);

      for (let row of examRes.rows) {
        if (!studentMap.has(row.id)) continue;
        const student = studentMap.get(row.id);

        subjects.forEach((subject) => {
          const code = subject.id.toString();
          const value = parseFloat(row[code]) || 0;

          let subjectEntry = student.results.find((r) => r.code === code);
          if (!subjectEntry) {
            subjectEntry = {
              code: code,
              subject: subject.name,
              marks: {},
              group: getSubjectGroup(parseInt(code)),
            };
            student.results.push(subjectEntry);
          }

          subjectEntry.marks[examAliases[key]] = value;
        });
      }
    }

    // Helper function to get subject group
    function getSubjectGroup(subjectId) {
      if (group_1.includes(subjectId)) return 1;
      if (group_2.includes(subjectId)) return 2;
      if (group_3.includes(subjectId)) return 3;
      if (group_4.includes(subjectId)) return 4;
      return 0;
    }

    // Calculate final marks and grades
    const totalExams = examKeys.length;
    const computeMark = (m1, m2 = 0, m3 = 0, o1 = 0, o2 = 0, o3 = 0) => {
      if (totalExams === 1) return m1;
      if (totalExams === 2) {
        if (formula === "average") return (m1 + m2) / 2;
        if (formula === "twoAdd") {
          const total = o1 + o2;
          if (total !== 100) return 0.5 * m1 + 0.5 * m2;
          return m1 * (o1 / 100) + m2 * (o2 / 100);
        }
      }
      if (totalExams === 3) {
        if (formula === "average") return (m1 + m2 + m3) / 3;
        if (formula === "threeAdd") {
          const total = o1 + o2 + o3;
          if (total !== 100) return 0.25 * m1 + 0.25 * m2 + 0.5 * m3;
          return m1 * (o1 / 100) + m2 * (o2 / 100) + m3 * (o3 / 100);
        }
        if (formula === "threeWeighted") {
          return 0.15 * m1 + 0.15 * m2 + 0.7 * m3;
        }
      }
      return 0;
    };

    // Calculate marks, grades, and points for each student
    studentMap.forEach((student) => {
      student.results.forEach((subject) => {
        const m1 = subject.marks[examAliases["exam_1"]] || 0;
        const m2 = subject.marks[examAliases["exam_2"]] || 0;
        const m3 = subject.marks[examAliases["exam_3"]] || 0;
        const o1 = examOutofs["exam_1"] || 0;
        const o2 = examOutofs["exam_2"] || 0;
        const o3 = examOutofs["exam_3"] || 0;

        const mark = computeMark(m1, m2, m3, o1, o2, o3);
        subject.marks.mark = mark;

        const { grade, points } = getGradeAndPoints(
          mark,
          parseInt(subject.code)
        );
        subject.marks.grade = grade;
        subject.points = points;

        // Get remarks based on points
        const remark = commentsCollection.find((c) => c.value === points);
        subject.remarks = remark ? remark.label : "Average";

        // Get instructor from subject teachers table
        const subjectTeachersTable = `subjectteachers_form_${form}`;
        pool
          .query(
            `
          SELECT teacher_id FROM ${subjectTeachersTable} 
          WHERE stream_id = $1 AND subject_id = $2 AND year = $3
        `,
            [student.stream_id, subject.code, year]
          )
          .then((teacherRes) => {
            if (teacherRes.rows.length > 0) {
              const teacherId = parseInt(teacherRes.rows[0].teacher_id);
              const teacher = staffCollection.find(
                (s) => s.value === teacherId
              );
              subject.instructor = teacher ? teacher.label : "N/A";
            } else {
              subject.instructor = "N/A";
            }
          })
          .catch(() => {
            subject.instructor = "N/A";
          });
      });

      // Calculate totals based on form level
      if (form == 1 || form == 2) {
        student.results.forEach((subject) => {
          student.totalMarks += subject.marks.mark || 0;
          student.totalPoints += subject.points || 0;
          student.includedSubjects.push(subject.code);
        });
      } else {
        active_group_1.forEach((subjectId) => {
          const subject = student.results.find(
            (r) => r.code === subjectId.toString()
          );
          if (subject) {
            student.totalMarks += subject.marks.mark || 0;
            student.totalPoints += subject.points || 0;
            student.includedSubjects.push(subject.code);
          }
        });

        if (active_group_2.length > 0) {
          const group2Subjects = student.results
            .filter((r) => active_group_2.includes(parseInt(r.code)))
            .sort((a, b) => (b.marks.mark || 0) - (a.marks.mark || 0))
            .slice(0, 2);

          group2Subjects.forEach((subject) => {
            student.totalMarks += subject.marks.mark || 0;
            student.totalPoints += subject.points || 0;
            student.includedSubjects.push(subject.code);
          });
        }

        if (active_group_3.length > 0) {
          const group3Subject = student.results
            .filter((r) => active_group_3.includes(parseInt(r.code)))
            .sort((a, b) => (b.marks.mark || 0) - (a.marks.mark || 0))
            .shift();

          if (group3Subject) {
            student.totalMarks += group3Subject.marks.mark || 0;
            student.totalPoints += group3Subject.points || 0;
            student.includedSubjects.push(group3Subject.code);
          }
        }

        if (active_group_4.length > 0) {
          const group4Subject = student.results
            .filter((r) => active_group_4.includes(parseInt(r.code)))
            .sort((a, b) => (b.marks.mark || 0) - (a.marks.mark || 0))
            .shift();

          if (group4Subject) {
            student.totalMarks += group4Subject.marks.mark || 0;
            student.totalPoints += group4Subject.points || 0;
            student.includedSubjects.push(group4Subject.code);
          }
        }
      }
    });

    // Calculate ranks
    const allStudents = Array.from(studentMap.values());
    allStudents.sort((a, b) => b.totalMarks - a.totalMarks);

    allStudents.forEach((student, index) => {
      if (
        index > 0 &&
        student.totalMarks === allStudents[index - 1].totalMarks
      ) {
        student.overallRank = allStudents[index - 1].overallRank;
      } else {
        student.overallRank = index + 1;
      }
    });

    const streamGroups = {};
    allStudents.forEach((student) => {
      if (!streamGroups[student.stream_id]) {
        streamGroups[student.stream_id] = [];
      }
      streamGroups[student.stream_id].push(student);
    });

    const streamTable = `form_${form}_streams`;
    const streamsRes = await pool.query(
      `SELECT id, stream_name FROM ${streamTable}`
    );
    const streamNameMap = new Map(
      streamsRes.rows.map((row) => [row.id, row.stream_name])
    );

    // Calculate subject ranks within each stream
    for (const [streamId, streamStudents] of Object.entries(streamGroups)) {
      streamStudents.sort((a, b) => b.totalMarks - a.totalMarks);

      streamStudents.forEach((student, index) => {
        if (
          index > 0 &&
          student.totalMarks === streamStudents[index - 1].totalMarks
        ) {
          student.streamRank = streamStudents[index - 1].streamRank;
        } else {
          student.streamRank = index + 1;
        }
      });

      subjects.forEach((subject) => {
        const subjectId = subject.id.toString();
        const studentsWithSubject = streamStudents.filter((s) =>
          s.results.some((r) => r.code === subjectId)
        );

        studentsWithSubject.sort((a, b) => {
          const aMark =
            a.results.find((r) => r.code === subjectId)?.marks.mark || 0;
          const bMark =
            b.results.find((r) => r.code === subjectId)?.marks.mark || 0;
          return bMark - aMark;
        });

        studentsWithSubject.forEach((student, index) => {
          if (index > 0) {
            const prevMark =
              studentsWithSubject[index - 1].results.find(
                (r) => r.code === subjectId
              )?.marks.mark || 0;
            const currentMark =
              student.results.find((r) => r.code === subjectId)?.marks.mark ||
              0;
            if (currentMark === prevMark) {
              student.subjectRanks = student.subjectRanks || {};
              student.subjectRanks[subjectId] =
                studentsWithSubject[index - 1].subjectRanks[subjectId];
              return;
            }
          }
          student.subjectRanks = student.subjectRanks || {};
          student.subjectRanks[subjectId] = index + 1;
        });
      });
    }

    // Extract term and year from exam name
    let term = "1";
    let year = "2024";
    const examNameParts = firstExamTable.split("_");

    const termIndex = examNameParts.indexOf("term");
    if (termIndex !== -1 && termIndex + 1 < examNameParts.length) {
      term = examNameParts[termIndex + 1];
    }

    if (examNameParts.length > 0) {
      const lastPart = examNameParts[examNameParts.length - 1];
      if (/^\d{4}$/.test(lastPart)) {
        year = lastPart;
      }
    }

    // Function to calculate AG grade from a table's marks
    const calculateAgGradeFromTable = async (
      tableName,
      studentId,
      formLevel
    ) => {
      const existsRes = await pool.query(`SELECT to_regclass($1) as exists`, [
        tableName,
      ]);
      if (!existsRes.rows[0].exists) return "E";

      const marksRes = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [studentId]
      );
      if (marksRes.rows.length === 0) return "E";

      const gradingTable = `grading_${tableName}`;
      const gradingRes = await pool.query(`SELECT to_regclass($1) as exists`, [
        gradingTable,
      ]);
      if (!gradingRes.rows[0].exists) return "E";

      const gradingCriteriaRes = await pool.query(
        `SELECT * FROM ${gradingTable}`
      );
      const gradingMap = new Map();
      gradingCriteriaRes.rows.forEach((row) => {
        gradingMap.set(row.id, {
          E: { min: row.e0, max: row.e1 },
          "D-": { min: row.dm0, max: row.dm1 },
          D: { min: row.d0, max: row.d1 },
          "D+": { min: row.dp0, max: row.dp1 },
          "C-": { min: row.cm0, max: row.cm1 },
          C: { min: row.c0, max: row.c1 },
          "C+": { min: row.cp0, max: row.cp1 },
          "B-": { min: row.bm0, max: row.bm1 },
          B: { min: row.b0, max: row.b1 },
          "B+": { min: row.bp0, max: row.bp1 },
          "A-": { min: row.am0, max: row.am1 },
          A: { min: row.a0, max: row.a1 },
        });
      });

      let totalPoints = 0;
      let includedSubjects = 0;
      const studentMarks = marksRes.rows[0];

      for (const [subjectId, mark] of Object.entries(studentMarks)) {
        if (subjectId === "id" || subjectId === "ag_grade") continue;

        const numericMark = parseFloat(mark) || 0;
        const subjectIdNum = parseInt(subjectId);
        const gradeRanges = gradingMap.get(subjectIdNum);
        if (!gradeRanges) continue;

        let grade = "E";
        for (const [g, range] of Object.entries(gradeRanges)) {
          if (numericMark >= range.min && numericMark <= range.max) {
            grade = g;
            break;
          }
        }

        totalPoints += pointsScale[grade] || 0;
        includedSubjects++;
      }

      if (formLevel == 1 || formLevel == 2) {
        const averagePoints = totalPoints / (includedSubjects || 1);
        return getAgGrade(Math.ceil(averagePoints));
      } else {
        for (const [grade, range] of Object.entries(gradePointScale)) {
          if (totalPoints >= range.min && totalPoints <= range.max) {
            return grade;
          }
        }
        return "E";
      }
    };

    // Function to get recent grade from previous term
    const getRecentGrade = async (form, term, year, studentId) => {
      let recentGrade = "E";
      let recentInit = "";
      const currentForm = parseInt(form);
      const currentTerm = parseInt(term);
      const currentYear = parseInt(year);

      try {
        if (currentForm === 1) {
          if (currentTerm === 1) {
            recentGrade = "";
            recentInit = "";
          } else if (currentTerm === 2) {
            const prevTable = `term_1_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F1T1";
          } else if (currentTerm === 3) {
            const prevTable = `term_2_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F1T2";
          }
        } else if (currentForm === 2) {
          if (currentTerm === 1) {
            const prevTable = `term_3_form_1_${currentYear - 1}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              1
            );
            recentInit = "F1T3";
          } else if (currentTerm === 2) {
            const prevTable = `term_1_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F2T1";
          } else if (currentTerm === 3) {
            const prevTable = `term_2_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F2T2";
          }
        } else if (currentForm === 3) {
          if (currentTerm === 1) {
            const prevTable = `term_3_form_2_${currentYear - 1}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              2
            );
            recentInit = "F2T3";
          } else if (currentTerm === 2) {
            const prevTable = `term_1_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F3T1";
          } else if (currentTerm === 3) {
            const prevTable = `term_2_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F3T2";
          }
        } else if (currentForm === 4) {
          if (currentTerm === 1) {
            const prevTable = `term_3_form_3_${currentYear - 1}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              3
            );
            recentInit = "F3T3";
          } else if (currentTerm === 2) {
            const prevTable = `term_1_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F4T1";
          } else if (currentTerm === 3) {
            const prevTable = `term_2_form_${currentForm}_${currentYear}`;
            recentGrade = await calculateAgGradeFromTable(
              prevTable,
              studentId,
              currentForm
            );
            recentInit = "F4T2";
          }
        }
      } catch (err) {
        console.error("Error calculating recent grade:", err);
        recentGrade = "E";
        recentInit = "";
      }

      return { recentGrade, recentInit };
    };

    // Helper function to determine AG grade (for Forms 1-2)
    function getAgGrade(averagePoints) {
      if (averagePoints >= 11) return "A";
      if (averagePoints >= 10) return "A-";
      if (averagePoints >= 9) return "B+";
      if (averagePoints >= 8) return "B";
      if (averagePoints >= 7) return "B-";
      if (averagePoints >= 6) return "C+";
      if (averagePoints >= 5) return "C";
      if (averagePoints >= 4) return "C-";
      return "D";
    }

    // Prepare final response
    const studentResults = await Promise.all(
      allStudents.map(async (student) => {
        const totalPossibleMarks = student.includedSubjects.length * 100;
        const totalPossiblePoints = student.includedSubjects.length * 12;

        let agGrade;
        if (form == 1 || form == 2) {
          const agValue =
            (student.totalMarks / (student.includedSubjects.length * 100)) * 12;
          agGrade = getAgGrade(Math.ceil(agValue));
        } else {
          for (const [grade, range] of Object.entries(gradePointScale)) {
            if (
              student.totalPoints >= range.min &&
              student.totalPoints <= range.max
            ) {
              agGrade = grade;
              break;
            }
          }
          agGrade = agGrade || "E";
        }

        // Get recent grade and init
        const { recentGrade, recentInit } = await getRecentGrade(
          form,
          term,
          year,
          student.id
        );

        const streamName =
          streamNameMap.get(student.stream_id) || "Unknown Stream";

        // Get class teacher name
        let classTeacherName = "N/A";
        const streamTeacherRes = await pool.query(
          `
        SELECT teacher_id FROM form_${form}_streams WHERE id = $1
      `,
          [student.stream_id]
        );

        if (streamTeacherRes.rows.length > 0) {
          const teacherId = parseInt(streamTeacherRes.rows[0].teacher_id);
          const teacher = staffCollection.find((s) => s.value === teacherId);
          classTeacherName = teacher ? teacher.label : "N/A";
        }

        // Get principal name
        let principalName = "N/A";
        const principalRes = await pool.query(
          "SELECT id FROM staff WHERE id = 4520"
        );
        if (principalRes.rows.length > 0) {
          const principalId = parseInt(principalRes.rows[0].id);
          const principal = staffCollection.find(
            (s) => s.value === principalId
          );
          principalName = principal ? principal.label : "N/A";
        }

        // Get class teacher remark based on AG grade
        let classTeacherRemark = "Average performance. Keep it up!";
        const classTeacherRemarkEntry = classteacherRemarkCollection.find(
          (r) => pointsScale[agGrade] === r.value
        );
        if (classTeacherRemarkEntry) {
          classTeacherRemark = classTeacherRemarkEntry.label;
        }

        // Get principal remark based on AG grade
        let principalRemark = "Good performance. Keep working hard!";
        const principalRemarkEntry = principalRemarkCollection.find(
          (r) => pointsScale[agGrade] === r.value
        );
        if (principalRemarkEntry) {
          principalRemark = principalRemarkEntry.label;
        }

        return {
          id: student.id,
          name: student.name,
          kcpe_marks: student.kcpe_marks,
          kcpe_grade: student.kcpe_grade,
          ag_grade: agGrade,
          current_init: `F${form}T${term}`,
          recent_init: recentInit,
          recent_grade: recentGrade,
          results: student.results.map((subject) => ({
            code: subject.code,
            subject: subject.subject,
            marks: subject.marks,
            points: subject.points,
            rank: `${student.subjectRanks?.[subject.code] || 0}/${
              streamGroups[student.stream_id]?.length || 1
            }`,
            remarks: subject.remarks,
            instructor: subject.instructor,
            included: student.includedSubjects.includes(subject.code),
          })),
          total_marks: `${Math.round(
            student.totalMarks
          )}/${totalPossibleMarks}`,
          total_points: `${student.totalPoints}/${totalPossiblePoints}`,
          stream_position: `${student.streamRank}/${
            streamGroups[student.stream_id]?.length || 1
          }`,
          overal_position: `${student.overallRank}/${allStudents.length}`,
          form: form,
          stream: streamName,
          image_path: `/student_images/${student.id}.jpg`,
        };
      })
    );

    // Final response structure
    const response = {
      schoolDetails: [
        { schoolname: particulars.schoolname },
        { motto: particulars.motto },
        { address: particulars.address },
        { phone: particulars.phone },
        { logo: particulars.logo_path || "/school_logo.png" },
        {
          class_teacher: {
            officer_name: classTeacherName,
            say: classTeacherRemark,
            signature: "/signatures/class_teacher.png",
          },
        },
        {
          principal: {
            officer_name: principalName,
            say: principalRemark,
            signature: "/signatures/principal.png",
          },
        },
      ],
      examDetails: {
        form: form,
        term: term,
        examname: "END TERM AVERAGE",
        year: year,
      },
      studentResults: studentResults,
    };

    // Return the response object that can be used by other code
    return response;
    // res.status(200).json(response)
  } catch (err) {
    next(err);
    throw err; // Re-throw the error so calling code can handle it
  }
};
