import pool from "../../../../config/db_connection.js";
import { createError } from "../../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../../utils/sanitizeString.js";

export const studentReportMarks = async (req, res, next) => {
  const { form, exams, formula, yearValue, studentIds, year, term, examname } =
    req.body;

  console.log("=== STARTING STUDENT REPORT MARKS PROCESS ===");
  console.log("Request body received:", {
    form,
    exams,
    formula,
    yearValue,
    studentIds,
    year,
    term,
    examname,
  });

  try {
    if (
      !form ||
      !exams ||
      !formula ||
      !yearValue ||
      !year ||
      !term ||
      !examname
    ) {
      console.error("❌ Missing required fields:", {
        form,
        exams,
        formula,
        yearValue,
        year,
        term,
        examname,
      });
      return next(createError(400, "Required fields are missing!"));
    }

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(yearValue);
    const sanitizedTerm = sanitizeStringVariables(term);
    console.log(
      "✅ Sanitized form:",
      sanitizedForm,
      "year:",
      sanitizedYear,
      "term:",
      sanitizedTerm
    );

    if (typeof exams !== "object" || exams === null) {
      console.error("❌ Exams is not an object:", exams);
      return next(createError(400, "Exams must be an object"));
    }

    // Determine system based on form
    const system844Forms = [19, 20, 21, 22];
    const isCBC = !system844Forms.includes(parseInt(form));
    console.log(`📚 System detected: ${isCBC ? "CBC" : "844"}`);

    // Points scale for 844 grading
    const pointsScale844 = {
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

    // Points scale for CBC grading
    const pointsScaleCBC = {
      BE2: 13,
      BE1: 14,
      AE2: 15,
      AE1: 16,
      ME2: 17,
      ME1: 18,
      EE2: 19,
      EE1: 20,
    };

    // Grade point scale for AG grade (Forms 3 & 4 - 844 system)
    const gradePointScale = {
      E: { min: 1, max: 10 },
      "D-": { min: 11, max: 17 },
      D: { min: 18, max: 24 },
      "D+": { min: 25, max: 31 },
      "C-": { min: 32, max: 38 },
      C: { min: 39, max: 45 },
      "C+": { min: 46, max: 52 },
      "B-": { min: 53, max: 59 },
      B: { min: 60, max: 66 },
      "B+": { min: 67, max: 73 },
      "A-": { min: 74, max: 80 },
      A: { min: 81, max: 84 },
    };

    // Define subject groups for 844 system
    const group_1 = [101, 102, 121, 122];
    const group_2 = [231, 232, 233, 236, 237];
    const group_3 = [311, 312, 313, 314, 315];
    const group_4 = [
      441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 501, 502, 503, 504,
      511,
    ];

    console.log("📚 Fetching school particulars...");
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
    console.log("✅ School particulars fetched:", particulars.schoolname);

    console.log("👥 Fetching staff data...");
    const staffRes = await pool.query(
      "SELECT id, title, fname, lname FROM staff"
    );
    const staffCollection = staffRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.title + " " + row.fname + " " + row.lname,
    }));
    console.log(
      `✅ Staff data fetched: ${staffCollection.length} staff members`
    );

    console.log("💬 Fetching comments...");
    const commentsRes = await pool.query("SELECT * FROM comments");
    const commentsCollection = commentsRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.comment,
    }));
    console.log(`✅ Comments fetched: ${commentsCollection.length} comments`);

    console.log("👨‍🏫 Fetching principal remarks...");
    const principalRemarkRes = await pool.query(
      "SELECT * FROM principal_remark"
    );
    const principalRemarkCollection = principalRemarkRes.rows.map((row) => ({
      value: parseInt(row.id),
      label: row.comment,
    }));
    console.log(
      `✅ Principal remarks fetched: ${principalRemarkCollection.length} remarks`
    );

    console.log("👩‍🏫 Fetching class teacher remarks...");
    const classteacherRemarkRes = await pool.query(
      "SELECT * FROM classteacher_remark"
    );
    const classteacherRemarkCollection = classteacherRemarkRes.rows.map(
      (row) => ({
        value: parseInt(row.id),
        label: row.comment,
      })
    );
    console.log(
      `✅ Class teacher remarks fetched: ${classteacherRemarkCollection.length} remarks`
    );

    console.log("📖 Fetching active subjects...");
    const subjectTable = `subjects`;
    const subjectsRes = await pool.query(
      `SELECT id, name, init, isselective FROM ${subjectTable} WHERE status = 1 AND level = $1`,
      [sanitizedForm]
    );
    const subjects = subjectsRes.rows;
    const subjectMap = new Map(subjects.map((sub) => [sub.id, sub]));
    console.log(`✅ Active subjects fetched: ${subjects.length} subjects`);

    const selectiveSubjects = subjects.filter((sub) => sub.isselective === 1);
    const nonSelectiveSubjects = subjects.filter(
      (sub) => sub.isselective !== 1
    );
    console.log(
      `📊 Subject breakdown: ${nonSelectiveSubjects.length} non-selective, ${selectiveSubjects.length} selective`
    );

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
    console.log(
      `📚 Active subject groups: Group1=${active_group_1.length}, Group2=${active_group_2.length}, Group3=${active_group_3.length}, Group4=${active_group_4.length}`
    );

    const examKeys = Object.keys(exams);
    const examTables = {};
    const examOutofs = {};
    const examAliases = {};
    const examIds = {};

    console.log("📝 Validating and preparing exams...");
    for (let key of examKeys) {
      const { name, alias, outof } = exams[key];
      console.log(`🔍 Processing exam ${key}:`, { name, alias, outof });

      examTables[key] = "exam";
      examOutofs[key] = parseFloat(outof);
      examAliases[key] = alias;
      examIds[key] = name;
      console.log(
        `✅ Exam ${key} validated: table=exam, exam_id=${name}, alias=${alias}, outof=${outof}`
      );
    }

    console.log("📊 Getting grading criteria...");
    const gradingTable = `grading_scheme`;

    const gradingTableRes = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [gradingTable]
    );

    if (!gradingTableRes.rows[0].exists) {
      console.error(`❌ Grading table ${gradingTable} does not exist`);
      return next(
        createError(400, `Grading table ${gradingTable} does not exist!`)
      );
    }

    // Fetch grading criteria for all subjects (both CBC and 844)
    const gradingRes = await pool.query(
      `SELECT * FROM ${gradingTable} WHERE subject_id = ANY($1)`,
      [subjects.map((sub) => sub.id)]
    );

    const gradingMap844 = new Map();
    const gradingMapCBC = new Map();

    gradingRes.rows.forEach((row) => {
      // Store 844 grading scheme
      gradingMap844.set(row.subject_id, {
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

      // Store CBC grading scheme
      gradingMapCBC.set(row.subject_id, {
        BE2: { min: row.be20, max: row.be21 },
        BE1: { min: row.be10, max: row.be11 },
        AE2: { min: row.ae20, max: row.ae21 },
        AE1: { min: row.ae10, max: row.ae11 },
        ME2: { min: row.me20, max: row.me21 },
        ME1: { min: row.me10, max: row.me11 },
        EE2: { min: row.ee20, max: row.ee21 },
        EE1: { min: row.ee10, max: row.ee11 },
      });
    });

    console.log(
      `✅ Grading criteria fetched for ${gradingRes.rows.length} subjects`
    );

    // Use correct grading map based on system
    const gradingMap = isCBC ? gradingMapCBC : gradingMap844;

    const getGradeAndPoints = (mark, subjectId) => {
      if (mark === null || mark === undefined || isNaN(mark)) {
        return { grade: isCBC ? "BE2" : "N/A", points: 0 };
      }

      const gradeRanges = gradingMap.get(subjectId);
      if (!gradeRanges) {
        console.warn(`⚠️ No grading criteria found for subject ${subjectId}`);
        return { grade: isCBC ? "BE2" : "N/A", points: 0 };
      }

      const numericMark = typeof mark === "string" ? parseFloat(mark) : mark;
      const pointsScale = isCBC ? pointsScaleCBC : pointsScale844;

      for (const [grade, range] of Object.entries(gradeRanges)) {
        if (numericMark >= range.min && numericMark <= range.max) {
          return { grade, points: pointsScale[grade] || 0 };
        }
      }

      if (isCBC) {
        if (numericMark < gradeRanges["BE2"].min) {
          return { grade: "BE2", points: pointsScaleCBC["BE2"] };
        }
        if (numericMark > gradeRanges["EE1"].max) {
          return { grade: "EE1", points: pointsScaleCBC["EE1"] };
        }
      } else {
        if (numericMark < gradeRanges["E"].min) {
          return { grade: "E", points: pointsScale844["E"] };
        }
        if (numericMark > gradeRanges["A"].max) {
          return { grade: "A", points: pointsScale844["A"] };
        }
      }

      return { grade: isCBC ? "BE2" : "N/A", points: 0 };
    };

    console.log("👨‍🎓 Fetching students...");
    const studentMap = new Map();

    const studentsRes = await pool.query(
      `SELECT id, fname || ' ' || lname AS name, kcpe_marks, stream_id, phone
       FROM students 
       WHERE current_form = $1 AND current_year = $2`,
      [sanitizedForm, sanitizedYear]
    );

    studentsRes.rows.forEach((student) => {
      studentMap.set(student.id, {
        id: student.id,
        name: student.name,
        kcpe_marks: student.kcpe_marks,
        kcpe_grade: getKcpeGrade(student.kcpe_marks),
        stream_id: student.stream_id,
        phone: student.phone,
        results: [],
        totalMarks: 0,
        totalPoints: 0,
        includedSubjects: [],
      });
    });
    console.log(`✅ Students fetched: ${studentMap.size} students`);

    function getKcpeGrade(marks) {
      if (!marks || marks === 0) return "N/A";
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

    console.log("📊 Processing non-selective subjects from 'exam' table...");
    for (const [key, tableName] of Object.entries(examTables)) {
      console.log(`📝 Processing exam table: ${tableName} for key: ${key}`);
      const examId = examIds[key];

      const examRes = await pool.query(
        `SELECT e.* FROM ${tableName} e
         JOIN students s ON s.id = e.id
         WHERE s.current_form = $1 AND s.current_year = $2 
         AND e.form = $3 AND e.year = $4 AND e.term = $5 AND e.exam_id = $6`,
        [
          sanitizedForm,
          sanitizedYear,
          sanitizedForm,
          sanitizedYear,
          sanitizedTerm,
          examId,
        ]
      );

      console.log(
        `✅ Exam table ${tableName} with exam_id ${examId} fetched ${examRes.rows.length} records`
      );

      for (let row of examRes.rows) {
        if (!studentMap.has(row.id)) continue;
        const student = studentMap.get(row.id);

        nonSelectiveSubjects.forEach((subject) => {
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

    console.log("📊 Processing selective subjects...");
    if (selectiveSubjects.length > 0) {
      const selectiveSubjectCodes = selectiveSubjects.map((sub) =>
        sub.id.toString()
      );

      const selectivesRes = await pool.query(
        `SELECT student_id, ${selectiveSubjectCodes
          .map((code) => `"${code}"`)
          .join(", ")} 
         FROM selectives WHERE student_id = ANY($1)`,
        [Array.from(studentMap.keys())]
      );

      console.log(
        `✅ Selective subjects data fetched for ${selectivesRes.rows.length} students`
      );

      const studentSelectivesMap = new Map();
      selectivesRes.rows.forEach((row) => {
        const selectedSubjects = [];
        for (const [code, value] of Object.entries(row)) {
          if (code !== "student_id" && value === 1) {
            selectedSubjects.push(code);
          }
        }
        studentSelectivesMap.set(row.student_id, selectedSubjects);
      });

      for (const [studentId, student] of studentMap.entries()) {
        const selectedSubjects = studentSelectivesMap.get(studentId) || [];
        console.log(
          `👨‍🎓 Student ${studentId} has ${selectedSubjects.length} selective subjects`
        );

        for (const subjectCode of selectedSubjects) {
          const subject = subjectMap.get(parseInt(subjectCode));
          if (!subject) continue;

          for (const [key, tableName] of Object.entries(examTables)) {
            const examId = examIds[key];
            const examRes = await pool.query(
              `SELECT "${subjectCode}" FROM ${tableName} 
               WHERE id = $1 AND form = $2 AND year = $3 AND term = $4 AND exam_id = $5`,
              [studentId, sanitizedForm, sanitizedYear, sanitizedTerm, examId]
            );

            if (examRes.rows.length > 0) {
              const value = parseFloat(examRes.rows[0][subjectCode]) || 0;

              let subjectEntry = student.results.find(
                (r) => r.code === subjectCode
              );
              if (!subjectEntry) {
                subjectEntry = {
                  code: subjectCode,
                  subject: subject.name,
                  marks: {},
                  group: getSubjectGroup(parseInt(subjectCode)),
                };
                student.results.push(subjectEntry);
              }

              subjectEntry.marks[examAliases[key]] = value;
            }
          }
        }
      }
    } else {
      console.log("ℹ️ No selective subjects to process");
    }

    function getSubjectGroup(subjectId) {
      if (group_1.includes(subjectId)) return 1;
      if (group_2.includes(subjectId)) return 2;
      if (group_3.includes(subjectId)) return 3;
      if (group_4.includes(subjectId)) return 4;
      return 0;
    }

    console.log("🧮 Calculating final marks and grades...");
    const totalExams = examKeys.length;
    const computeMark = (m1, m2 = 0, m3 = 0, o1 = 0, o2 = 0, o3 = 0) => {
      if (isCBC) {
        // CBC: Always use average formula
        if (totalExams === 1) return m1;
        if (totalExams === 2) return (m1 + m2) / 2;
        if (totalExams === 3) return (m1 + m2 + m3) / 3;
        // For n exams, calculate average
        const marks = [m1, m2, m3].filter((m) => m > 0);
        if (marks.length === 0) return 0;
        return marks.reduce((sum, m) => sum + m, 0) / marks.length;
      } else {
        // 844 system: Use existing formulas
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
      }
    };

    console.log("📈 Calculating marks, grades, and points for each student...");
    for (const student of studentMap.values()) {
      console.log(`📊 Processing student ${student.id}: ${student.name}`);

      for (const subject of student.results) {
        const m1 = subject.marks[examAliases["exam_1"]] || 0;
        const m2 = subject.marks[examAliases["exam_2"]] || 0;
        const m3 = subject.marks[examAliases["exam_3"]] || 0;
        const o1 = examOutofs["exam_1"] || 0;
        const o2 = examOutofs["exam_2"] || 0;
        const o3 = examOutofs["exam_3"] || 0;

        const mark = computeMark(m1, m2, m3, o1, o2, o3);
        subject.marks.mark = Math.round(mark);

        const { grade, points } = getGradeAndPoints(
          Math.round(mark),
          parseInt(subject.code)
        );
        subject.marks.grade = grade;
        subject.points = points;

        const remark = commentsCollection.find((c) => c.value === points);
        subject.remarks = remark ? remark.label : "Average";

        const subjectTeachersTable = `subjectteachers`;
        try {
          const teacherRes = await pool.query(
            `SELECT teacher_id FROM ${subjectTeachersTable} 
             WHERE stream_id = $1 AND subject_id = $2 AND year = $3`,
            [student.stream_id, subject.code, yearValue]
          );

          if (teacherRes.rows.length > 0) {
            const teacherId = parseInt(teacherRes.rows[0].teacher_id);
            const teacher = staffCollection.find((s) => s.value === teacherId);
            if (teacher) {
              const matches = teacher.label.match(/\b(\w)/g);
              subject.instructor = matches
                ? `${matches[1]} ${matches[2]}`
                : " - ";
            } else {
              subject.instructor = " - ";
            }
          } else {
            subject.instructor = " - ";
          }
        } catch (err) {
          console.warn(
            `⚠️ Error fetching instructor for subject ${subject.code}:`,
            err.message
          );
          subject.instructor = " - ";
        }
      }

      console.log(`📚 Calculating totals for student ${student.id}...`);
      if (!isCBC) {
        // 844 system logic
        if (form == 19 || form == 20) {
          student.results.forEach((subject) => {
            if (subject.group !== 4) {
              student.totalMarks += subject.marks.mark || 0;
              student.totalPoints += subject.points || 0;
              student.includedSubjects.push(subject.code);
            }
          });

          if (active_group_4.length > 0) {
            const group4Subject = student.results
              .filter((r) => r.group === 4)
              .sort((a, b) => (b.marks.mark || 0) - (a.marks.mark || 0))
              .shift();

            if (group4Subject) {
              student.totalMarks += group4Subject.marks.mark || 0;
              student.totalPoints += group4Subject.points || 0;
              student.includedSubjects.push(group4Subject.code);
            }
          }
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
      } else {
        // CBC system: Include all subjects
        student.results.forEach((subject) => {
          student.totalMarks += subject.marks.mark || 0;
          student.totalPoints += subject.points || 0;
          student.includedSubjects.push(subject.code);
        });
      }

      console.log(
        `✅ Student ${student.id} totals: ${student.totalMarks} marks, ${student.totalPoints} points, ${student.includedSubjects.length} included subjects`
      );
    }


    console.log("🏆 Calculating ranks...");
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

    console.log(
      `📊 Stream groups created: ${Object.keys(streamGroups).length} streams`
    );

    const streamsRes = await pool.query(
      `SELECT s.stream_id, sn.stream_name 
       FROM streams s
       INNER JOIN stream_names sn ON s.stream_id = sn.id
       WHERE s.form = $1`,
      [form]
    );
    const streamNameMap = new Map(
      streamsRes.rows.map((row) => [row.stream_id, row.stream_name])
    );
    console.log(`✅ Stream names fetched: ${streamsRes.rows.length} streams`);

    for (const [streamId, streamStudents] of Object.entries(streamGroups)) {
      console.log(
        `📈 Calculating ranks for stream ${streamId} with ${streamStudents.length} students`
      );
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

    // Helper function to get AG grade for 844 system
    function getAgGrade(averagePoints) {
      if (averagePoints >= 11) return "A";
      if (averagePoints >= 10) return "A-";
      if (averagePoints >= 9) return "B+";
      if (averagePoints >= 8) return "B";
      if (averagePoints >= 7) return "B-";
      if (averagePoints >= 6) return "C+";
      if (averagePoints >= 5) return "C";
      if (averagePoints >= 4) return "C-";
      if (averagePoints >= 3) return "D+";
      if (averagePoints >= 2) return "D";
      if (averagePoints >= 1) return "D-";
      return "E";
    }

    // Helper function to get AG grade for CBC system
    function getAgGradeCBC(averagePoints) {
      if (averagePoints >= 19.5) return "EE1";
      if (averagePoints >= 18.5) return "EE2";
      if (averagePoints >= 17.5) return "ME1";
      if (averagePoints >= 16.5) return "ME2";
      if (averagePoints >= 15.5) return "AE1";
      if (averagePoints >= 14.5) return "AE2";
      if (averagePoints >= 13.5) return "BE1";
      return "BE2";
    }

    // Function to calculate AG grade from previous exam data for 844 system
    const calculateAgGradeFromTable844 = async (
      formLevel,
      termLevel,
      yearLevel,
      studentId
    ) => {
      console.log(
        `🔍 Calculating 844 AG grade for student ${studentId}, form ${formLevel}, term ${termLevel}, year ${yearLevel}`
      );

      try {
        const marksRes = await pool.query(
          `SELECT * FROM exam WHERE id = $1 AND form = $2 AND term = $3 AND year = $4`,
          [studentId, formLevel, termLevel, yearLevel]
        );

        if (marksRes.rows.length === 0) {
          console.warn(
            `⚠️ No marks found for student ${studentId} in previous period`
          );
          return "E";
        }

        let totalPoints = 0;
        let includedSubjects = 0;
        const studentMarks = marksRes.rows[0];

        for (const [subjectId, mark] of Object.entries(studentMarks)) {
          if (
            subjectId === "id" ||
            subjectId === "form" ||
            subjectId === "term" ||
            subjectId === "year" ||
            subjectId === "ag_grade"
          )
            continue;

          const numericMark = parseFloat(mark);
          if (isNaN(numericMark) || numericMark === 0) continue;

          const subjectIdNum = parseInt(subjectId);
          const gradeRanges = gradingMap844.get(subjectIdNum);
          if (!gradeRanges) continue;

          let grade = "E";
          for (const [g, range] of Object.entries(gradeRanges)) {
            if (numericMark >= range.min && numericMark <= range.max) {
              grade = g;
              break;
            }
          }

          totalPoints += pointsScale844[grade] || 0;
          includedSubjects++;
        }

        if (includedSubjects === 0) {
          return "E";
        }

        if (formLevel == 19 || formLevel == 20) {
          const averagePoints = totalPoints / includedSubjects;
          const agGrade = getAgGrade(Math.ceil(averagePoints));
          console.log(
            `✅ 844 AG grade calculated: ${agGrade} (avg points: ${averagePoints})`
          );
          return agGrade;
        } else {
          for (const [grade, range] of Object.entries(gradePointScale)) {
            if (totalPoints >= range.min && totalPoints <= range.max) {
              console.log(
                `✅ 844 AG grade calculated: ${grade} (total points: ${totalPoints})`
              );
              return grade;
            }
          }
          console.log(
            `✅ 844 AG grade calculated: E (total points: ${totalPoints})`
          );
          return "E";
        }
      } catch (err) {
        console.error(`❌ Error calculating 844 AG grade:`, err.message);
        return "E";
      }
    };

    // Function to calculate AG grade from previous exam data for CBC system
    const calculateAgGradeFromTableCBC = async (
      formLevel,
      termLevel,
      yearLevel,
      studentId
    ) => {
      console.log(
        `🔍 Calculating CBC AG grade for student ${studentId}, form ${formLevel}, term ${termLevel}, year ${yearLevel}`
      );

      try {
        const marksRes = await pool.query(
          `SELECT * FROM exam WHERE id = $1 AND form = $2 AND term = $3 AND year = $4`,
          [studentId, formLevel, termLevel, yearLevel]
        );

        if (marksRes.rows.length === 0) {
          console.warn(
            `⚠️ No marks found for student ${studentId} in previous period`
          );
          return "BE";
        }

        let totalPoints = 0;
        let includedSubjects = 0;
        const studentMarks = marksRes.rows[0];

        for (const [subjectId, mark] of Object.entries(studentMarks)) {
          if (
            subjectId === "id" ||
            subjectId === "form" ||
            subjectId === "term" ||
            subjectId === "year" ||
            subjectId === "ag_grade"
          )
            continue;

          const numericMark = parseFloat(mark);
          if (isNaN(numericMark) || numericMark === 0) continue;

          const subjectIdNum = parseInt(subjectId);
          const gradeRanges = gradingMapCBC.get(subjectIdNum);
          if (!gradeRanges) continue;

          let grade = "BE";
          for (const [g, range] of Object.entries(gradeRanges)) {
            if (numericMark >= range.min && numericMark <= range.max) {
              grade = g;
              break;
            }
          }

          totalPoints += pointsScaleCBC[grade] || 0;
          includedSubjects++;
        }

        if (includedSubjects === 0) {
          return "BE";
        }

        const averagePoints = totalPoints / includedSubjects;
        const agGrade = getAgGradeCBC(averagePoints);
        console.log(
          `✅ CBC AG grade calculated: ${agGrade} (avg points: ${averagePoints})`
        );
        return agGrade;
      } catch (err) {
        console.error(`❌ Error calculating CBC AG grade:`, err.message);
        return "BE";
      }
    };

    // Function to get recent grade for 844 system
    const getRecentGrade844 = async (
      currentForm,
      currentTerm,
      currentYear,
      studentId
    ) => {
      console.log(
        `🔍 Getting recent 844 grade for student ${studentId}, form ${currentForm}, term ${currentTerm}, year ${currentYear}`
      );

      let recentGrade = "";
      let recentInit = "";
      const formNum = parseInt(currentForm);
      const termNum = parseInt(currentTerm);
      const yearNum = parseInt(currentYear);

      try {
        if (formNum === 19) {
          if (termNum === 1) {
            recentGrade = "";
            recentInit = "";
          } else if (termNum === 2) {
            recentGrade = await calculateAgGradeFromTable844(
              19,
              1,
              yearNum,
              studentId
            );
            recentInit = "F1T1";
          } else if (termNum === 3) {
            recentGrade = await calculateAgGradeFromTable844(
              19,
              2,
              yearNum,
              studentId
            );
            recentInit = "F1T2";
          }
        } else if (formNum === 20) {
          if (termNum === 1) {
            recentGrade = await calculateAgGradeFromTable844(
              19,
              3,
              yearNum - 1,
              studentId
            );
            recentInit = "F1T3";
          } else if (termNum === 2) {
            recentGrade = await calculateAgGradeFromTable844(
              20,
              1,
              yearNum,
              studentId
            );
            recentInit = "F2T1";
          } else if (termNum === 3) {
            recentGrade = await calculateAgGradeFromTable844(
              20,
              2,
              yearNum,
              studentId
            );
            recentInit = "F2T2";
          }
        } else if (formNum === 21) {
          if (termNum === 1) {
            recentGrade = await calculateAgGradeFromTable844(
              20,
              3,
              yearNum - 1,
              studentId
            );
            recentInit = "F2T3";
          } else if (termNum === 2) {
            recentGrade = await calculateAgGradeFromTable844(
              21,
              1,
              yearNum,
              studentId
            );
            recentInit = "F3T1";
          } else if (termNum === 3) {
            recentGrade = await calculateAgGradeFromTable844(
              21,
              2,
              yearNum,
              studentId
            );
            recentInit = "F3T2";
          }
        } else if (formNum === 22) {
          if (termNum === 1) {
            recentGrade = await calculateAgGradeFromTable844(
              21,
              3,
              yearNum - 1,
              studentId
            );
            recentInit = "F3T3";
          } else if (termNum === 2) {
            recentGrade = await calculateAgGradeFromTable844(
              22,
              1,
              yearNum,
              studentId
            );
            recentInit = "F4T1";
          } else if (termNum === 3) {
            recentGrade = await calculateAgGradeFromTable844(
              22,
              2,
              yearNum,
              studentId
            );
            recentInit = "F4T2";
          }
        }
      } catch (err) {
        console.error(
          `❌ Error getting recent 844 grade for student ${studentId}:`,
          err.message
        );
        recentGrade = "";
        recentInit = "";
      }

      console.log(`✅ Recent 844 grade: ${recentGrade}, init: ${recentInit}`);
      return { recentGrade, recentInit };
    };

    // Function to get recent grade for CBC system
    const getRecentGradeCBC = async (
      currentForm,
      currentTerm,
      currentYear,
      studentId
    ) => {
      console.log(
        `🔍 Getting recent CBC grade for student ${studentId}, form ${currentForm}, term ${currentTerm}, year ${currentYear}`
      );

      let recentGrade = "";
      let recentInit = "";
      const termNum = parseInt(currentTerm);
      const yearNum = parseInt(currentYear);
      const formNum = parseInt(currentForm);

      // CBC forms mapping
      const cbcFormMap = {
        "-1": "PP1",
        0: "PP2",
        1: "GR1",
        2: "GR2",
        3: "GR3",
        4: "GR4",
        5: "GR5",
        6: "GR6",
        7: "GR7",
        8: "GR8",
        9: "GR9",
        10: "GR10",
        11: "GR11",
        12: "GR12",
      };

      try {
        const currentFormKey = cbcFormMap[formNum.toString()] || currentForm;

        if (termNum === 1) {
          // T1: Get previous form T3
          const prevFormNum = formNum - 1;
          if (prevFormNum >= -1) {
            const prevFormKey = cbcFormMap[prevFormNum.toString()];
            if (prevFormKey) {
              recentGrade = await calculateAgGradeFromTableCBC(
                prevFormNum,
                3,
                yearNum - 1,
                studentId
              );
              recentInit = `${prevFormKey}T3`;
            } else {
              recentGrade = "";
              recentInit = "";
            }
          } else {
            recentGrade = "";
            recentInit = "";
          }
        } else if (termNum === 2) {
          // T2: Get current form T1
          recentGrade = await calculateAgGradeFromTableCBC(
            formNum,
            1,
            yearNum,
            studentId
          );
          recentInit = `${currentFormKey}T1`;
        } else if (termNum === 3) {
          // T3: Get current form T2
          recentGrade = await calculateAgGradeFromTableCBC(
            formNum,
            2,
            yearNum,
            studentId
          );
          recentInit = `${currentFormKey}T2`;
        }
      } catch (err) {
        console.error(
          `❌ Error getting recent CBC grade for student ${studentId}:`,
          err.message
        );
        recentGrade = "";
        recentInit = "";
      }

      console.log(`✅ Recent CBC grade: ${recentGrade}, init: ${recentInit}`);
      return { recentGrade, recentInit };
    };

    console.log("🎯 Preparing final response...");
    const studentResults = await Promise.all(
      allStudents.map(async (student) => {
        console.log(
          `📋 Preparing response for student ${student.id}: ${student.name}`
        );
        // const totalPossibleMarks = student.includedSubjects.length * 100;
        // const totalPossiblePoints = isCBC
        //   ? student.includedSubjects.length * 16
        //   : student.includedSubjects.length * 12;
        const totalPossibleMarks = isCBC ? student.includedSubjects.length * 100 : 700;
        const totalPossiblePoints = isCBC
          ? student.includedSubjects.length * 16
          : 84;

        // Calculate AG grade from CURRENT data (req.body form, term, year)
        let agGrade;
        if (isCBC) {
          // CBC: Calculate average points from current results
          const agValue =
            student.totalPoints / (student.includedSubjects.length || 1);
          agGrade = getAgGradeCBC(agValue);
        } else {
          // 844 system: Calculate from current results
          if (form == 19 || form == 20) {
            const agValue =
              (student.totalMarks / (student.includedSubjects.length * 100)) *
              12;
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
        }
        console.log(`✅ Student ${student.id} AG grade (current): ${agGrade}`);

        // Get RECENT grade from PREVIOUS period data
        let recentGrade, recentInit;
        if (isCBC) {
          ({ recentGrade, recentInit } = await getRecentGradeCBC(
            form,
            term,
            year,
            student.id
          ));
        } else {
          ({ recentGrade, recentInit } = await getRecentGrade844(
            form,
            term,
            year,
            student.id
          ));
        }

        const streamName = streamNameMap.get(student.stream_id);

        let classTeacherName = "N/A";
        try {
          const streamTeacherRes = await pool.query(
            `SELECT s.teacher_id FROM streams s WHERE s.id = $1`,
            [student.stream_id]
          );

          if (streamTeacherRes.rows.length > 0) {
            const teacherId = parseInt(streamTeacherRes.rows[0].teacher_id);
            const teacher = staffCollection.find((s) => s.value === teacherId);
            classTeacherName = teacher ? teacher.label : "N/A";
          }
        } catch (err) {
          console.warn("⚠️ Error fetching class teacher:", err.message);
        }

        let principalName = "N/A";
        try {
          const principalRes = await pool.query(
            "SELECT id FROM staff WHERE isprincipal = true"
          );
          if (principalRes.rows.length > 0) {
            const principalId = parseInt(principalRes.rows[0].id);
            const principal = staffCollection.find(
              (s) => s.value === principalId
            );
            principalName = principal ? principal.label : "N/A";
          }
        } catch (err) {
          console.warn("⚠️ Error fetching principal:", err.message);
        }

        let classTeacherRemark = "Average performance. Keep it up!";
        const pointsForRemark = isCBC
          ? pointsScaleCBC[agGrade]
          : pointsScale844[agGrade];
        const classTeacherRemarkEntry = classteacherRemarkCollection.find(
          (r) => pointsForRemark === r.value
        );
        if (classTeacherRemarkEntry) {
          classTeacherRemark = classTeacherRemarkEntry.label;
        }

        let principalRemark = "Good performance. Keep working hard!";
        const principalRemarkEntry = principalRemarkCollection.find(
          (r) => pointsForRemark === r.value
        );
        if (principalRemarkEntry) {
          principalRemark = principalRemarkEntry.label;
        }

        let imagePath = "/images/defaults/user_p.webp";
        try {
          const imageRes = await pool.query(
            "SELECT path FROM student_images WHERE id = $1",
            [student.id]
          );
          if (imageRes.rows.length > 0 && imageRes.rows[0].path) {
            imagePath = imageRes.rows[0].path;
          }
        } catch (err) {
          console.warn("⚠️ Error fetching student image:", err.message);
        }

        // Create current_init based on system
        let currentInit;
        if (isCBC) {
          const cbcFormMap = {
            "-1": "PP1",
            0: "PP2",
            1: "GR1",
            2: "GR2",
            3: "GR3",
            4: "GR4",
            5: "GR5",
            6: "GR6",
            7: "GR7",
            8: "GR8",
            9: "GR9",
            10: "GR10",
            11: "GR11",
            12: "GR12",
          };
          const formKey = cbcFormMap[form.toString()] || form;
          currentInit = `${formKey}T${term}`;
        } else {
          const formNumber =
            form == 19 ? 1 : form == 20 ? 2 : form == 21 ? 3 : 4;
          currentInit = `F${formNumber}T${term}`;
        }

        return {
          id: student.id,
          name: student.name,
          kcpe_marks: student.kcpe_marks,
          kcpe_grade: student.kcpe_grade,
          phone: student.phone,
          ag_grade: agGrade,
          current_init: currentInit,
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
            instructor: subject.instructor || " - ",
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
          stream_id: student.stream_id,
          stream: streamName,
          comments: [
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
          image_path: imagePath,
        };
      })
    );

    console.log("✅ Final response prepared successfully");

    const response = {
      schoolDetails: [
        { schoolname: particulars.schoolname },
        { motto: particulars.motto },
        { address: particulars.address },
        { phone: particulars.phone },
        { logo: particulars.logo_path || "/school_logo.png" },
      ],
      examDetails: {
        form: form,
        term: term,
        examname: examname,
        year: year,
      },
      studentResults: studentResults,
      studentIds: studentIds,
    };

    console.log("🎉 PROCESS COMPLETED SUCCESSFULLY!");
    console.log(
      `📊 Final response: ${studentResults.length} students processed`
    );

    // res.status(200).json(response);
    return response;
  } catch (err) {
    console.error("💥 CRITICAL ERROR:", err);
    console.error("💥 Error stack:", err.stack);
    next(err);
  }
};
