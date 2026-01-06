import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";

// Exam initialization and registration endpoint
export const addExam = async (req, res, next) => {

  const { term, form, year, exam_name } = req.body;

  try {
    if (!term || !form || !year) {
      throw createError(400, "Missing required parameters: term, form, year");
    }

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedYear = sanitizeStringVariables(year);

    // Table references
    const examsTable = "exams";
    const subjectsTable = "subjects";
    const studentsTable = "students";
    const examMapTable = "exam"; // table mapping student_id to exams (has uni_val unique)

    // If no exam_name provided, process default three exams
    if (!exam_name) {
      const examTables = [
        `Opener_Term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`,
        `Mid_Term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`,
        `End_Term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`,
      ];

      for (const examName of examTables) {
        await processSingleExam(
          examName,
          sanitizedTerm,
          sanitizedForm,
          sanitizedYear,
          examsTable,
          subjectsTable,
          studentsTable,
          examMapTable
        );
      }

      return res.status(201).json({
        success: true,
        message: "Default exams processed successfully",
        processedExams: examTables,
      });
    } else {
      // When a specific exam name is given
      const sanitizedExamName = sanitizeStringVariables(exam_name);

      await processSingleExam(
        sanitizedExamName,
        sanitizedTerm,
        sanitizedForm,
        sanitizedYear,
        examsTable,
        subjectsTable,
        studentsTable,
        examMapTable
      );

      return res.status(201).json({
        success: true,
        message: "Single exam processed successfully",
        processedExam: sanitizedExamName,
      });
    }
  } catch (error) {
    console.error("[addExam] error:", error);
    next(error);
  }
};

// ----------------------------------------------------------------------

async function processSingleExam(
  examName,
  term,
  form,
  year,
  examsTable,
  subjectsTable,
  studentsTable,
  examMapTable
) {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if exam already exists
    const { rows: existingExam } = await client.query(
      `SELECT id FROM ${examsTable} WHERE exam_val = $1`,
      [examName]
    );

    if (existingExam.length > 0) {
      const examId = existingExam[0].id;

      await updateStudentRecordsForExam(
        client,
        examId,
        examName,
        term,
        form,
        year,
        studentsTable,
        subjectsTable,
        examMapTable
      );
    } else {

      await addNewExamWithData(
        client,
        examName,
        term,
        form,
        year,
        examsTable,
        subjectsTable,
        studentsTable,
        examMapTable
      );
    }

    await client.query("COMMIT");

  } catch (error) {
    // console.error(`[processSingleExam] error for exam ${examName}:`, error);
    await client.query("ROLLBACK");
    throw createError(500, `Error processing exam ${examName}`, {
      details: error.message,
    });
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------------------

async function updateStudentRecordsForExam(
  client,
  examId,
  examName,
  term,
  form,
  year,
  studentsTable,
  subjectsTable,
  examMapTable
) {

  // Get all current students for that form/year
  const { rows: students } = await client.query(
    `SELECT id FROM ${studentsTable} WHERE current_form = $1 AND current_year = $2`,
    [form, year]
  );

  if (students.length === 0)
    throw createError(400, "No students found for this form/year");

  // Get all subjects for that form
  const { rows: subjects } = await client.query(
    `SELECT id FROM ${subjectsTable} WHERE level = $1`,
    [form]
  );

  if (subjects.length === 0)
    throw createError(400, "No subjects found for this level");

  // Add student entries to exam table if not exist (use uni_val = examId + '_' + studentId)
  for (const student of students) {
    const uniVal = `${examId}_${student.id}`;
    await client.query(
      `INSERT INTO ${examMapTable}
        (id, exam_id, form, year, term, exam, exam_val, uni_val)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (uni_val) DO UPDATE SET
         exam_id = EXCLUDED.exam_id,
         form = EXCLUDED.form,
         year = EXCLUDED.year,
         term = EXCLUDED.term,
         exam = EXCLUDED.exam,
         exam_val = EXCLUDED.exam_val;`,
      [student.id, examId, form, year, term, examName, examName, uniVal]
    );
  }

  // Add grading_scheme data per subject only (not per student)
  // uni_val = examId + '_' + subjectId
  for (const subject of subjects) {
    const gsUniVal = `${examId}_${subject.id}`;
    await client.query(
      `INSERT INTO grading_scheme
        (exam_id, subject_id, uni_val,
         e0, e1, dm0, dm1, d0, d1, dp0, dp1,
         cm0, cm1, c0, c1, cp0, cp1, bm0, bm1,
         b0, b1, bp0, bp1, am0, am1, a0, a1, be0, be1, ae0, ae1, me0, me1, ee0, ee1)
       VALUES
        ($1, $2, $3,
         0, 29, 30, 34, 35, 39, 40, 44, 45,
         49, 50, 54, 55, 59, 60, 64, 65, 69,
         70, 74, 75, 79, 80, 100, 0, 24, 25, 49, 50, 74, 75, 100)
       ON CONFLICT (uni_val) DO UPDATE SET
         e0 = EXCLUDED.e0,
         e1 = EXCLUDED.e1,
         dm0 = EXCLUDED.dm0,
         dm1 = EXCLUDED.dm1,
         d0 = EXCLUDED.d0,
         d1 = EXCLUDED.d1,
         dp0 = EXCLUDED.dp0,
         dp1 = EXCLUDED.dp1,
         cm0 = EXCLUDED.cm0,
         cm1 = EXCLUDED.cm1,
         c0 = EXCLUDED.c0,
         c1 = EXCLUDED.c1,
         cp0 = EXCLUDED.cp0,
         cp1 = EXCLUDED.cp1,
         bm0 = EXCLUDED.bm0,
         bm1 = EXCLUDED.bm1,
         b0 = EXCLUDED.b0,
         b1 = EXCLUDED.b1,
         bp0 = EXCLUDED.bp0,
         bp1 = EXCLUDED.bp1,
         am0 = EXCLUDED.am0,
         am1 = EXCLUDED.am1,
         a0 = EXCLUDED.a0,
         a1 = EXCLUDED.a1,
         be0 = EXCLUDED.be0,
         be1 = EXCLUDED.be1,
         ae0 = EXCLUDED.ae0,
         ae1 = EXCLUDED.ae1,
         me0 = EXCLUDED.me0,
         me1 = EXCLUDED.me1,
         ee0 = EXCLUDED.ee0,
         ee1 = EXCLUDED.ee1;`,
      [examId, subject.id, gsUniVal]
    );
  }

  // Add paper setup (only if not exists)
  // uni_val = examId + '_' + subjectId
  for (const subject of subjects) {
    const psUniVal = `${examId}_${subject.id}`;
    await client.query(
      `INSERT INTO paper_setup
        (exam_id, id, papers, formula, uni_val)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (uni_val) DO UPDATE SET
         papers = EXCLUDED.papers,
         formula = EXCLUDED.formula,
         exam_id = EXCLUDED.exam_id;`,
      [examId, subject.id, 2, "twoPaperAvg", psUniVal]
    );
  }

}

// ----------------------------------------------------------------------

async function addNewExamWithData(
  client,
  examName,
  term,
  form,
  year,
  examsTable,
  subjectsTable,
  studentsTable,
  examMapTable
) {

  // Add exam record (keep original examsTable behavior)
  const { rows: examRes } = await client.query(
    `INSERT INTO ${examsTable} (form, term, year, exam_name, exam_val, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
    [form, term, year, examName, examName]
  );

  const examId = examRes[0].id;

  // Get all students
  const { rows: students } = await client.query(
    `SELECT id FROM ${studentsTable} WHERE current_form = $1 AND current_year = $2`,
    [form, year]
  );

  if (students.length === 0)
    throw createError(400, "No students found for this form/year");

  // Get all subjects
  const { rows: subjects } = await client.query(
    `SELECT id FROM ${subjectsTable} WHERE level = $1`,
    [form]
  );

  if (subjects.length === 0)
    throw createError(400, "No subjects found for this level");

  // Insert exam mapping for all students (uni_val = examId + '_' + studentId)
  for (const student of students) {
    const uniVal = `${examId}_${student.id}`;
    await client.query(
      `INSERT INTO ${examMapTable}
        (id, exam_id, form, year, term, exam, exam_val, uni_val)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (uni_val) DO UPDATE SET
         exam_id = EXCLUDED.exam_id,
         form = EXCLUDED.form,
         year = EXCLUDED.year,
         term = EXCLUDED.term,
         exam = EXCLUDED.exam,
         exam_val = EXCLUDED.exam_val;`,
      [student.id, examId, form, year, term, examName, examName, uniVal]
    );
  }

  // Insert grading_scheme per subject only (uni_val = examId + '_' + subjectId)
  for (const subject of subjects) {
    const gsUniVal = `${examId}_${subject.id}`;
    await client.query(
      `INSERT INTO grading_scheme
        (exam_id, subject_id, uni_val,
         e0, e1, dm0, dm1, d0, d1, dp0, dp1,
         cm0, cm1, c0, c1, cp0, cp1, bm0, bm1,
         b0, b1, bp0, bp1, am0, am1, a0, a1, be0, be1, ae0, ae1, me0, me1, ee0, ee1)
       VALUES
        ($1, $2, $3,
         0, 29, 30, 34, 35, 39, 40, 44, 45,
         49, 50, 54, 55, 59, 60, 64, 65, 69,
         70, 74, 75, 79, 80, 100, 0, 24, 25, 49, 50, 74, 75, 100)
       ON CONFLICT (uni_val) DO UPDATE SET
         e0 = EXCLUDED.e0,
         e1 = EXCLUDED.e1,
         dm0 = EXCLUDED.dm0,
         dm1 = EXCLUDED.dm1,
         d0 = EXCLUDED.d0,
         d1 = EXCLUDED.d1,
         dp0 = EXCLUDED.dp0,
         dp1 = EXCLUDED.dp1,
         cm0 = EXCLUDED.cm0,
         cm1 = EXCLUDED.cm1,
         c0 = EXCLUDED.c0,
         c1 = EXCLUDED.c1,
         cp0 = EXCLUDED.cp0,
         cp1 = EXCLUDED.cp1,
         bm0 = EXCLUDED.bm0,
         bm1 = EXCLUDED.bm1,
         b0 = EXCLUDED.b0,
         b1 = EXCLUDED.b1,
         bp0 = EXCLUDED.bp0,
         bp1 = EXCLUDED.bp1,
         am0 = EXCLUDED.am0,
         am1 = EXCLUDED.am1,
         a0 = EXCLUDED.a0,
         a1 = EXCLUDED.a1,
         be0 = EXCLUDED.be0,
         be1 = EXCLUDED.be1,
         ae0 = EXCLUDED.ae0,
         ae1 = EXCLUDED.ae1,
         me0 = EXCLUDED.me0,
         me1 = EXCLUDED.me1,
         ee0 = EXCLUDED.ee0,
         ee1 = EXCLUDED.ee1;`,
      [examId, subject.id, gsUniVal]
    );
  }

  // Paper setup creation - only if missing (uni_val = examId + '_' + subjectId)
  for (const subject of subjects) {
    const psUniVal = `${examId}_${subject.id}`;
    await client.query(
      `INSERT INTO paper_setup (exam_id, id, papers, formula, uni_val)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (uni_val) DO UPDATE SET
         papers = EXCLUDED.papers,
         formula = EXCLUDED.formula,
         exam_id = EXCLUDED.exam_id;`,
      [examId, subject.id, 2, "twoPaperAvg", psUniVal]
    );
  }

}
// ----------------------------------------------------------------------

process.on("SIGTERM", () => {
  pool.end().catch((err) => {
    console.error("Error during shutdown", err);
  });
  process.exit(0);
});