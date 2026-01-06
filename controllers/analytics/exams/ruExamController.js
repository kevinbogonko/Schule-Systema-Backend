import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";
import { studentReportMarks } from "../reports/reportform/studentReport.js";
import path from "path";
import xlsx from "xlsx"

// Get Results for All Students with a POST request
export const getAllStudentsMarks = async (req, res, next) => {
  // Validate request content type first
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // Get parameters from request body
  const { exam_name, term, form, year } = req.body;

  try {
    // Validate input more thoroughly
    if (!term || !form || !year || !exam_name)
      return next(createError(400, "Missing required parameters!"));

    // More strict sanitization
    const sanitizedExamName = sanitizeStringVariables(exam_name);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    // Validate inputs against stricter regex pattern
    const validPattern = /^[a-z0-9_]+$/i; // Case insensitive, only alphanumeric + underscore
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedTerm) ||
      !validPattern.test(sanitizedForm) ||
      !validPattern.test(sanitizedYear)
    )
      return next(createError(400, "Invalid inputs!"));

    // Check for SQL injection patterns (basic example)
    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    if (sqlInjectionPattern.test(sanitizedExamName))
      return next(createError(400, "Invalid input detected"));

    // Get active subjects first
    const subjectsTable = `subjects_form_${sanitizedForm}`;
    const activeSubjects = await pool.query(
      `SELECT id FROM ${subjectsTable} WHERE status = 1`
    );

    if (activeSubjects.rows.length === 0)
      return next(createError(404, "No active subjects found for this form"));

    const subjectIds = activeSubjects.rows.map((subject) => subject.id);
    const subjectColumns = subjectIds.map((id) => `m."${id}"`).join(", ");

    const examTermTable = `${sanitizedExamName}_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;

    // Modified: Use students table with current_form and current_year conditions
    const query = `
            SELECT 
                m.id,
                s.name,
                ${subjectColumns}
            FROM ${examTermTable} AS m
            JOIN students AS s ON m.id = s.id
            WHERE s.current_form = $1 AND s.current_year = $2
        `;

    // Execute query with transaction for safety
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(query, [sanitizedForm, sanitizedYear]);

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Students marks not found",
        });
      }

      const formattedResults = result.rows.map((row) => ({
        student_id: row.id,
        student_name: row.name,
        marks: Object.fromEntries(
          subjectIds.map((id) => [id, row[id] ?? null])
        ),
      }));

      res.status(200).json({
        status: 200,
        data: formattedResults,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === "42P01") {
      return next(
        createError(
          404,
          "Exam or student data not found for the provided inputs"
        )
      );
    }

    next(createError(500, "An error occurred while processing your request"));
  }
};

// Get Results for Specific Students with a POST request
export const getStudentMarks = async (req, res, next) => {
  // Validate request content type first
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // Get parameters from request body
  const { exam_name, term, form, year, student_id } = req.body;

  try {
    // Validate input more thoroughly
    if (!term || !form || !year || !student_id || !exam_name)
      return next(createError(400, "Missing required parameters!"));

    // Validate student_id is numeric
    if (!Number.isInteger(Number(student_id)) || Number(student_id) <= 0)
      return next(
        createError(400, "Invalid student ID: must be a positive integer")
      );

    // More strict sanitization
    const sanitizedExamName = sanitizeStringVariables(exam_name);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    // Validate inputs against stricter regex pattern
    const validPattern = /^[a-z0-9_]+$/i; // Case insensitive, only alphanumeric + underscore
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedTerm) ||
      !validPattern.test(sanitizedForm) ||
      !validPattern.test(sanitizedYear)
    )
      return next(createError(400, "Invalid inputs!"));

    // Check for SQL injection patterns (basic example)
    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    if (sqlInjectionPattern.test(sanitizedExamName))
      return next(createError(400, "Invalid input detected"));

    // Get active subjects first
    const subjectsTable = `subjects_form_${sanitizedForm}`;
    const activeSubjects = await pool.query(
      `SELECT id FROM ${subjectsTable} WHERE status = 1`
    );

    if (activeSubjects.rows.length === 0)
      return next(createError(404, "No active subjects found for this form"));

    const subjectIds = activeSubjects.rows.map((subject) => subject.id);
    const subjectColumns = subjectIds.map((id) => `m."${id}"`).join(", ");

    const examTermTable = `${sanitizedExamName}_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;

    // Modified: Use students table with current_form and current_year conditions
    const query = `
            SELECT 
                m.id,
                s.name,
                ${subjectColumns}
            FROM ${examTermTable} AS m
            JOIN students AS s ON m.id = s.id
            WHERE m.id = $1 AND s.current_form = $2 AND s.current_year = $3
        `;

    // Execute query with transaction for safety
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(query, [
        student_id,
        sanitizedForm,
        sanitizedYear,
      ]);

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Student marks not found",
        });
      }

      // Transform the result to a more structured format
      const formattedResult = {
        student_id: result.rows[0].id,
        student_name: result.rows[0].name,
        marks: {},
      };

      subjectIds.forEach((id) => {
        formattedResult.marks[`${id}`] = result.rows[0][`${id}`];
      });

      res.status(200).json({
        status: 200,
        data: formattedResult,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === "42P01") {
      return next(
        createError(
          404,
          "Exam or student data not found for the provided inputs"
        )
      );
    }

    next(createError(500, "An error occurred while processing your request"));
  }
};

// Update results for specific Student with a PUT request
export const updateStudentMark = async (req, res, next) => {
  // Validate request content type first
  if (!req.is("application/json"))
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );

  // Get parameters from request body
  const { exam_name, term, form, year, results, student_id } = req.body;

  try {
    if (!term || !form || !year || !student_id || !exam_name || !results)
      return next(createError(400, "Missing required parameters!"));

    // Validate student_id is numeric
    if (!Number.isInteger(Number(student_id)) || Number(student_id) <= 0)
      return next(
        createError(400, "Invalid student ID: must be a positive integer")
      );

    // More strict sanitization
    const sanitizedExamName = sanitizeStringVariables(exam_name);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    // Validate inputs against stricter regex pattern
    const validPattern = /^[a-z0-9_]+$/i; // Case insensitive, only alphanumeric + underscore
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedTerm) ||
      !validPattern.test(sanitizedForm) ||
      !validPattern.test(sanitizedYear)
    )
      return next(createError(400, "Invalid inputs!"));

    // Handle results(marks)
    if (typeof results !== "object" || results === null)
      next(createError(400, "Results must be an object"));

    // Process results and prepare query
    const columns = Object.keys(results);
    const values = Object.values(results);

    // Validate each result value
    for (const [key, value] of Object.entries(results)) {
      if (isNaN(value) || value === "")
        next(createError(400, `Invalid mark value for subject code ${key}`));

      const numericValue = parseFloat(value);
      if (numericValue < 0 || numericValue > 99)
        next(
          createError(
            400,
            `Mark for subject code ${key} must be between 0 and 99`
          )
        );
    }

    if (columns.length === 0) next(createError(400, "No valid marks provided"));

    // Check for SQL injection patterns (basic example)
    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    if (sqlInjectionPattern.test(sanitizedExamName))
      return next(createError(400, "Invalid input detected"));

    // Exam Table
    const examTermTable = `${sanitizedExamName}_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;

    // Build dynamic SET clause
    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");

    // Add student_id as the last parameter
    const queryValues = [...values, student_id];
    const studentParamIndex = queryValues.length; // Position of student_id in params

    // Update Student Mark
    const query = {
      text: `UPDATE "${examTermTable}" SET ${setClause} WHERE id = $${studentParamIndex} RETURNING *`,
      values: queryValues,
    };

    // Execute query
    const result = await pool.query(query);

    if (result.rowCount === 0)
      next(createError(404, "Student record not found"));

    res.status(200).json({
      status: 200,
      message: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateAllStudentMark = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { exam_id, results } = req.body;

  try {
    if (!exam_id || !results || !Array.isArray(results)) {
      return next(createError(400, "Missing or invalid required parameters!"));
    }

    // const sanitizedExamName = sanitizeStringVariables(exam_name);

    // const validPattern = /^[a-z0-9_]+$/i;
    // if (!validPattern.test(sanitizedExamName)) {
    //   return next(createError(400, "Invalid exam name format!"));
    // }

    const examTermTable = "exam";

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const student of results) {
        const student_id = student.id;
        const marksObj = student.marks;

        if (!Number.isInteger(Number(student_id)) || Number(student_id) <= 0) {
          throw createError(400, `Invalid student ID: ${student_id}`);
        }

        const markKeys = Object.keys(marksObj);
        const markValues = Object.values(marksObj);

        if (markKeys.length === 0) {
          throw createError(
            400,
            `No marks provided for student ID: ${student_id}`
          );
        }

        // Validation
        for (const [col, val] of Object.entries(marksObj)) {
          if (isNaN(val) || val === "") {
            throw createError(
              400,
              `Invalid mark for student ${student_id}, column ${col}`
            );
          }
          const numericValue = parseFloat(val);
          if (numericValue < 0 || numericValue > 99) {
            throw createError(
              400,
              `Mark for student ${student_id}, column ${col} must be between 0 and 99`
            );
          }
        }

        // Build SET clause dynamically
        const setClause = markKeys
          .map((col, index) => `"${col}" = $${index + 1}`)
          .join(", ");
        const values = [...markValues, student_id]; // last param is the WHERE id

        const updateQuery = {
          text: `UPDATE "${examTermTable}" SET ${setClause} WHERE id = $${values.length} AND exam_id = ${exam_id} RETURNING *`,
          values,
        };

        const updateResult = await client.query(updateQuery);

        if (updateResult.rowCount === 0) {
          throw createError(
            404,
            `Student record not found for Reg No: ${student_id}`
          );
        }
      }

      await client.query("COMMIT");

      res.status(200).json({
        status: 200,
        message: "All student marks updated successfully",
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      next(transactionError);
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

// JUST FOR TEST
// GET EXAM LIST
export const examList = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      throw createError(
        415,
        "Unsupported Media Type: Expected application/json"
      );
    }

    const { form, term, year } = req.body;

    if (!form || !term || !year) {
      throw createError(
        400,
        "Missing required parameters: form, term, and year are mandatory."
      );
    }

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedYear = sanitizeStringVariables(year);

    const inputPattern = /^[a-zA-Z0-9_]+$/;
    if (
      !inputPattern.test(sanitizedForm) ||
      !inputPattern.test(sanitizedTerm) ||
      !inputPattern.test(sanitizedYear)
    ) {
      throw createError(
        400,
        "Invalid input: Only alphanumeric characters and underscores allowed."
      );
    }

    const query = `
      SELECT * 
      FROM exams 
      WHERE year = $1 AND term = $2 AND form = $3
      ORDER BY id ASC;
    `;

    const { rows } = await pool.query(query, [sanitizedYear, sanitizedTerm, sanitizedForm]);

    if (rows.length === 0) {
      throw createError(404, "No exams found for the provided year and term.");
    }

    return res.status(200).json(rows);
    
  } catch (error) {
    return next(error);
  }
};

// GET EXAM
export const getexam = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      throw createError(
        415,
        "Unsupported Media Type: Expected application/json"
      );
    }

    const { id } = req.body;

    if (!id) {
      throw createError(
        400,
        "Missing required parameters!"
      );
    }

    const inputPattern = /^[a-zA-Z0-9_]+$/;
    if (
      !inputPattern.test(id)
    ) {
      throw createError(
        400,
        "Invalid input!"
      );
    }

    const query = `
      SELECT * 
      FROM exams 
      WHERE id = $1
      ORDER BY id ASC;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw createError(404, "No exam found!");
    }

    return res.status(200).json(rows[0]);
    
  } catch (error) {
    return next(error);
  }
};

// UPDATE EXAM
export const updateExam = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      throw createError(
        415,
        "Unsupported Media Type: Expected application/json"
      );
    }

    const { id, exam_name, scheduled_at } = req.body;

    if (!id || !exam_name || !scheduled_at) {
      throw createError(
        400,
        "Missing required parameters!"
      );
    }

    const inputPattern = /^[a-zA-Z0-9_]+$/;
    if (!inputPattern.test(id)) {
      throw createError(
        400,
        "Invalid input!"
      );
    }

    // Check if exam exists
    const checkQuery = `SELECT * FROM exams WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw createError(404, "No exam found!");
    }

    // Update exam
    const updateQuery = `
      UPDATE exams 
      SET exam_name = $1, scheduled_at = $2 
      WHERE id = $3 
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [exam_name, scheduled_at, id]);

    return res.status(200).json({
      message: "Exam updated successfully",
      exam: rows[0]
    });
    
  } catch (error) {
    return next(error);
  }
};

// DELETE EXAM
export const deleteExam = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      throw createError(
        415,
        "Unsupported Media Type: Expected application/json"
      );
    }

    const { id } = req.body;

    if (!id) {
      throw createError(
        400,
        "Missing required parameter!"
      );
    }

    const inputPattern = /^[a-zA-Z0-9_]+$/;
    if (!inputPattern.test(id)) {
      throw createError(
        400,
        "Invalid input!"
      );
    }

    // Check if exam exists
    const checkQuery = `SELECT * FROM exams WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw createError(404, "No exam found!");
    }

    // Delete exam
    const deleteQuery = `DELETE FROM exams WHERE id = $1 RETURNING *;`;
    const { rows } = await pool.query(deleteQuery, [id]);

    return res.status(200).json({
      message: "Exam deleted successfully",
      deletedExam: rows[0]
    });
    
  } catch (error) {
    return next(error);
  }
};


// CHECK AND RETURN ACTIVE SUBJECTS IN EXAM MARK TABLE
export const subjectExistInExamTable = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { form, exam } = req.body;
  const nonCBCForms = [19, 20, 21, 22];

  let client;

  try {
    if (!form || !exam) {
      return next(createError(400, "Missing required parameters!"));
    }

    const sanitizedExamName = sanitizeStringVariables(exam);
    const sanitizedForm = sanitizeStringVariables(form);

    const validPattern = /^[a-z0-9_]+$/i;
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedForm)
    ) {
      return next(createError(400, "Invalid inputs!"));
    }

    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    if (sqlInjectionPattern.test(sanitizedExamName)) {
      return next(createError(400, "Invalid input detected"));
    }

    const examTermTable = `exam`;
    const subjectsTable = `subjects`;

    client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Check if examTermTable exists
      const examTableCheck = await client.query(
        `SELECT to_regclass($1) AS exists`,
        [examTermTable]
      );
      if (!examTableCheck.rows[0].exists) {
        await client.query("ROLLBACK");
        return next(
          createError(404, `Exam table does not exist.`)
        );
      }

      // 2. Get active subjects - now selecting both id and name
      const subjectResult = await client.query(
        `SELECT id::text, name FROM "${subjectsTable}" WHERE status = 1 AND level = $1`, [sanitizedForm]
      );

      if (subjectResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return next(createError(404, `No active ${nonCBCForms.includes(sanitizedForm) ? "subjects" : "learning areas"} found.`));
      }

      const subjects = subjectResult.rows;

      // 3. Get columns from examTermTable
      const columnResult = await client.query(
        `SELECT column_name FROM information_schema.columns 
                 WHERE table_name = $1`,
        [examTermTable.toLowerCase()]
      );
      const columnNames = columnResult.rows.map((row) => row.column_name);

      // 4. Filter subjects where the string version of the id exists in the table's columns
      const validSubjects = subjects.filter((subject) => {
        return (
          columnNames.includes(subject.id) || columnNames.includes(subject.name)
        );
      });

      if (validSubjects.length === 0) {
        await client.query("ROLLBACK");
        return next(
          createError(404, `No matching ${nonCBCForms.includes(sanitizedForm) ? "subjects" : "learning areas"} found in exam table.`)
        );
      }

      await client.query("COMMIT");

      // Return both id (as string) and name for valid subjects
      const formattedSubjects = validSubjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
      }));

      res.status(200).json(formattedSubjects);
    } catch (queryErr) {
      await client.query("ROLLBACK");
      return next(createError(500, "Database transaction failed."));
    }
  } catch (err) {
    return next(createError(500, "Internal Server Error"));
  } finally {
    if (client) {
      client.release();
    }
  }
};

// GET STUDENT MARKS FOR CERTAIN SUBJECT
export const ExamSubjectMarks = async (req, res, next) => {
  // 1. Ensure request is JSON
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2. Destructure inputs and constants
  const { form, exam_id, subject } = req.body;
  const nonCBCForms = [19, 20, 21, 22];
  const examTermTable = "exam";

  // 3. Basic presence validation
  if (form === undefined || exam_id === undefined || subject === undefined) {
    return next(
      createError(400, "Missing required parameters: form, exam_id, subject")
    );
  }

  // 4. Parse and validate numeric inputs
  const parsedForm = Number(form);
  const parsedExamId = Number(exam_id);
  if (Number.isNaN(parsedForm) || Number.isNaN(parsedExamId)) {
    return next(createError(400, "form and exam_id must be valid numbers"));
  }
  if (!Number.isInteger(parsedForm) || !Number.isInteger(parsedExamId)) {
    return next(createError(400, "form and exam_id must be integers"));
  }

  // 5. Validate subject column name (only allow letters, numbers and underscore)
  //    and prevent SQL identifier injection.
  const subjectPattern = /^[a-zA-Z0-9_]+$/;
  if (!subjectPattern.test(String(subject))) {
    return next(createError(400, "Invalid subject column name"));
  }
  const sanitizedSubject = String(subject);

  // 6. Acquire a client from the pool
  let client;
  try {
    client = await pool.connect();

    // 7. Ensure exam table exists
    const tableExistsRes = await client.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1) AS exists`,
      [examTermTable.toLowerCase()]
    );

    if (!tableExistsRes.rows[0].exists) {
      return next(createError(404, "Exam table not found"));
    }

    // 8. Ensure the main subject column exists
    const mainColumnRes = await client.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.columns
         WHERE table_name = $1
         AND column_name = $2
       ) AS exists`,
      [examTermTable.toLowerCase(), sanitizedSubject.toLowerCase()]
    );

    if (!mainColumnRes.rows[0].exists) {
      const label = nonCBCForms.includes(parsedForm)
        ? "Subject"
        : "Learning area";
      return next(
        createError(404, `${label} column "${sanitizedSubject}" not found`)
      );
    }

    // 9. Find all paper columns for this subject (subject_%)
    const paperColumnsRes = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = $1
       AND column_name LIKE $2
       ORDER BY column_name`,
      [examTermTable.toLowerCase(), `${sanitizedSubject.toLowerCase()}_%`]
    );

    const paperColumns = paperColumnsRes.rows.map((r) => r.column_name);

    // 10. Build the SELECT column list safely (identifiers controlled by validation above)
    //     Use double quotes so column names with mixed case are preserved if needed.
    const selectColumns = [
      `m.id`,
      `s.fname`,
      `s.lname`,
      `m."${sanitizedSubject.toLowerCase()}" AS "${sanitizedSubject}"`,
      ...paperColumns.map((col) => `m."${col}"`),
    ];

    // 11. Build and run the parameterized query
    const sql = `
      SELECT ${selectColumns.join(", ")}
      FROM "${examTermTable}" AS m
      JOIN students AS s ON m.id = s.id
      WHERE s.current_form = $1 AND m.exam_id = $2
      ORDER BY s.fname, s.lname
    `;

    const result = await client.query(sql, [parsedForm, parsedExamId]);

    // 12. If no rows, return 404
    if (result.rows.length === 0) {
      const label = nonCBCForms.includes(parsedForm)
        ? "subject"
        : "learning area";
      return next(
        createError(404, `No student marks found for this ${label}.`)
      );
    }

    // 13. Transform rows to consistent JSON shape and fill missing paper columns with 0
    const transformedResults = result.rows.map((row) => {
      const base = {
        id: row.id,
        fname: row.fname,
        lname: row.lname,
        [sanitizedSubject]: row[sanitizedSubject] ?? 0,
      };

      paperColumns.forEach((col) => {
        base[col] = row[col] ?? 0;
      });

      return base;
    });

    // 14. Return results
    return res.status(200).json(transformedResults);
  } catch (err) {
    return next(err);
  } finally {
    if (client) client.release();
  }
};

// EXAM PAPER SETUP FOR ALL SUBJECTS- (PAPER 1, 2, 3)
export const allPaperSetup = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { form, exam } = req.body;

  try {
    if (!exam || !form) {
      return next(createError(400, "Missing required parameters!"));
    }

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedExamName = sanitizeStringVariables(exam);

    const validPattern = /^[a-z0-9_]+$/i;
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedForm)
    ) {
      return next(createError(400, "Invalid inputs!"));
    }

    const sqlInjectionPattern =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    if (sqlInjectionPattern.test(sanitizedExamName)) {
      return next(createError(400, "Invalid input detected"));
    }

    const allowedSubjectTables = [
      "subjects_form_1",
      "subjects_form_2",
      "subjects_form_3",
      "subjects_form_4",
    ];
    const subjectsTable = `subjects_form_${sanitizedForm}`;
    if (!allowedSubjectTables.includes(subjectsTable)) {
      return next(createError(400, "Invalid form!"));
    }

    const paperSetupTable = `${sanitizedExamName}_paper_setup`;

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const subjectQuery = `SELECT id FROM ${subjectsTable} WHERE status = $1`;
      const subjectResult = await client.query(subjectQuery, [1]);

      if (!subjectResult.rows.length) {
        await client.query("ROLLBACK");
        return next(createError(404, "No matching subjects found."));
      }

      const subjectIds = subjectResult.rows.map((row) => row.id);

      const paperQuery = `SELECT * FROM ${paperSetupTable} WHERE id = ANY($1)`;
      const paperResult = await client.query(paperQuery, [subjectIds]);

      await client.query("COMMIT");

      return res.status(200).json(paperResult.rows);
    } catch (err) {
      await client.query("ROLLBACK");
      return next(createError(500, "Failed during paper setup query."));
    } finally {
      client.release();
    }
  } catch (err) {
    return next(createError(500, "Server error"));
  }
};

// EXAM PAPER SETUP FOR ONE SUBJECT- (PAPER 1, 2, 3)
export const paperSetup = async (req, res, next) => {
  // 1. Ensure request is JSON
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2. Extract request data
  const { form, exam_id, subject } = req.body;
  const nonCBCForms = [19, 20, 21, 22];
  const paperSetupTable = "paper_setup";
  const subjectsTable = "subjects";

  // 3. Validate required fields
  if (form === undefined || exam_id === undefined || subject === undefined) {
    return next(
      createError(400, "Missing required parameters: form, exam_id, subject")
    );
  }

  // 4. Validate numeric inputs (form & exam_id must be integers)
  const parsedForm = Number(form);
  const parsedExamId = Number(exam_id);

  if (Number.isNaN(parsedForm) || Number.isNaN(parsedExamId)) {
    return next(createError(400, "form and exam_id must be valid numbers"));
  }
  if (!Number.isInteger(parsedForm) || !Number.isInteger(parsedExamId)) {
    return next(createError(400, "form and exam_id must be integers"));
  }

  // 5. Validate subject (must be alphanumeric/underscore only)
  const subjectPattern = /^[a-zA-Z0-9_]+$/;
  if (!subjectPattern.test(String(subject))) {
    return next(createError(400, "Invalid subject identifier"));
  }
  const sanitizedSubject = String(subject);

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 6. Check if subject ID exists and is active for this form/level
    const checkSubjectQuery = `
      SELECT id 
      FROM ${subjectsTable} 
      WHERE id = $1 AND status = 1 AND level = $2
    `;

    const checkSubjectResult = await client.query(checkSubjectQuery, [
      sanitizedSubject,
      parsedForm,
    ]);

    if (!checkSubjectResult.rows.length) {
      await client.query("ROLLBACK");
      const label = nonCBCForms.includes(parsedForm)
        ? "Subject"
        : "Learning area";
      return next(createError(404, `${label} not found or inactive.`));
    }

    // 7. Fetch record from paperSetup table
    const paperQuery = `
      SELECT * 
      FROM ${paperSetupTable} 
      WHERE id = $1 AND exam_id = $2
    `;

    const paperResult = await client.query(paperQuery, [
      sanitizedSubject,
      parsedExamId,
    ]);

    await client.query("COMMIT");

    // 8. Return result, empty array is valid (no papers set yet)
    return res.status(200).json(paperResult.rows);
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    return next(createError(500, "Failed to fetch paper setup details."));
  } finally {
    if (client) client.release();
  }
};

export const paperSetupUpdate = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { id, exam_id, results } = req.body;
  try {
    if (!id || !exam_id || !results)
      return next(createError(400, "Missing required parameters!"));

    // Validate subject_id is numeric
    if (!Number.isInteger(Number(id)) || Number(id) <= 0)
      return next(
        createError(400, "Invalid subject ID: must be a positive integer")
      );

    // Validate subject_id is numeric
    if (!Number.isInteger(Number(exam_id)) || Number(exam_id) <= 0)
      return next(
        createError(400, "Invalid EXAM ID: must be a positive integer")
      );

    // // More strict sanitization
    // const sanitizedExamID = sanitizeStringVariables(exam_id);

    // Validate inputs against stricter regex pattern
    // const validPattern = /^[a-z0-9_]+$/i; // Case insensitive, only alphanumeric + underscore
    // if (!validPattern.test(sanitizedExamName))
    //   return next(createError(400, "Invalid inputs!"));

    // Handle results(marks)
    if (typeof results !== "object" || results === null)
      next(createError(400, "Results must be an object"));

    // Process results and prepare query
    const columns = Object.keys(results);
    const values = Object.values(results);

    // Check for SQL injection patterns (basic example)
    // const sqlInjectionPattern =
    //   /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bEXEC\b|\b--\b)/i;
    // if (sqlInjectionPattern.test(sanitizedExamName))
    //   return next(createError(400, "Invalid input detected"));

    const paperSetupTable = `paper_setup`;

    // Build dynamic SET clause
    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");

    // Add subject id as the last parameter
    const queryValues = [...values, id];
    const paperSetupParamIndex = queryValues.length; // Position of subject id in params

    // Update Student Mark
    const query = {
      text: `UPDATE "${paperSetupTable}" SET ${setClause} WHERE id = $${paperSetupParamIndex} AND exam_id = ${exam_id} RETURNING *`,
      values: queryValues,
    };

    // Execute query
    const result = await pool.query(query);

    if (result.rowCount === 0)
      next(createError(404, "Paper setup record not found"));

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Process Marks for whole class/form
export const procesMarks = async (req, res, next) => {
  const { exam, form } = req.body;

  try {
    if (!exam || !form) {
      return next(createError(400, "Invalid exam or form provided"));
    }

    // Sanitize inputs
    const sanitizedExam = sanitizeStringVariables(exam);
    const sanitizedForm = sanitizeStringVariables(form);

    const examTable = sanitizedExam;
    const subjectTable = `subjects_form_${sanitizedForm}`;
    const gradingTable = `grading_${sanitizedExam}`;

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

    // Define subject groups
    const group_1 = [101, 102, 121, 122];
    const group_2 = [231, 232, 233, 236, 237];
    const group_3 = [311, 312, 313, 314, 315];
    const group_4 = [
      441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 501, 502, 503, 504,
      511,
    ];

    // Step 1: Query subjects table to get all ids and initials with status = 1
    const subjectsQuery = `SELECT id, init FROM ${subjectTable} WHERE status = 1`;
    const subjectsResult = await pool.query(subjectsQuery);

    if (subjectsResult.rows.length === 0) {
      return next(createError(404, "No active subjects found"));
    }

    const activeSubjects = subjectsResult.rows.map((row) => row.id);
    // Create a map of subject IDs to their initials
    const subjectInitialsMap = {};
    subjectsResult.rows.forEach((row) => {
      subjectInitialsMap[row.id] = row.init;
    });

    // Step 2: Categorize active subjects into groups
    const active_group_1 = group_1.filter((id) => activeSubjects.includes(id));
    const active_group_2 = group_2.filter((id) => activeSubjects.includes(id));
    const active_group_3 = group_3.filter((id) => activeSubjects.includes(id));
    const active_group_4 = group_4.filter((id) => activeSubjects.includes(id));

    // Check if we have at least one active subject in each required group
    if (
      active_group_1.length === 0 ||
      active_group_2.length === 0 ||
      active_group_3.length === 0 ||
      active_group_4.length === 0
    ) {
      return next(
        createError(
          400,
          "Insufficient active subjects in one or more required groups"
        )
      );
    }

    // Step 3: Query grading table only for active subjects
    const gradingQuery = `SELECT * FROM ${gradingTable} WHERE id = ANY($1)`;
    const gradingResult = await pool.query(gradingQuery, [activeSubjects]);

    if (gradingResult.rows.length === 0) {
      return next(
        createError(404, "No grading criteria found for active subjects")
      );
    }

    // Create a map of grading criteria for quick lookup
    const gradingMap = {};
    gradingResult.rows.forEach((row) => {
      gradingMap[row.id] = {
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
      };
    });

    // Step 4: Query exam table and get columns for active subjects
    const subjectColumns = [
      ...active_group_1,
      ...active_group_2,
      ...active_group_3,
      ...active_group_4,
    ]
      .map((id) => `"${id}"`)
      .join(", ");

    const examQuery = `SELECT id, ${subjectColumns} FROM ${examTable}`;
    const examResult = await pool.query(examQuery);

    if (examResult.rows.length === 0) {
      return next(createError(404, "No exam records found"));
    }

    // Step 5: Query students table for names
    // Modified: Use students table with current_form condition
    const studentsQuery = `SELECT id, CONCAT(fname, ' ', lname) AS name FROM students WHERE current_form = $1`;
    const studentsResult = await pool.query(studentsQuery, [sanitizedForm]);

    if (studentsResult.rows.length === 0) {
      return next(createError(404, "No students found"));
    }

    // Create a map of student names for quick lookup
    const studentsMap = {};
    studentsResult.rows.forEach((row) => {
      studentsMap[row.id] = row.name;
    });

    // Helper function to determine grade and points
    const getGradeAndPoints = (value, subjectId) => {
      if (value === null || value === undefined)
        return { grade: "N/A", points: 0 };

      const gradeRanges = gradingMap[subjectId];
      if (!gradeRanges) return { grade: "N/A", points: 0 };

      for (const [grade, range] of Object.entries(gradeRanges)) {
        if (value >= range.min && value <= range.max) {
          return {
            grade: `${value} ${grade}`,
            points: pointsScale[grade],
          };
        }
      }

      return { grade: `${value} N/A`, points: 0 };
    };

    // Process each exam record
    let processedRecords = examResult.rows.map((record) => {
      const totalActiveSubjects =
        active_group_1.length +
        active_group_2.length +
        active_group_3.length +
        active_group_4.length;
      const result = {
        id: record.id,
        name: studentsMap[record.id] || "Unknown",
        subjects: {},
        marks: 0,
        total_marks: totalActiveSubjects * 100,
        points: 0,
        total_points: totalActiveSubjects * 12,
      };

      // Process all subjects for all forms
      const allActiveSubjects = [
        ...active_group_1,
        ...active_group_2,
        ...active_group_3,
        ...active_group_4,
      ];
      let totalMarks = 0;
      let totalPoints = 0;

      allActiveSubjects.forEach((subjectId) => {
        if (record[subjectId] !== undefined) {
          const { grade, points } = getGradeAndPoints(
            record[subjectId],
            subjectId
          );
          // Use subject initial instead of ID
          result.subjects[subjectInitialsMap[subjectId]] = grade;
          totalMarks += record[subjectId] || 0;
          totalPoints += points;
        }
      });

      if (form == 1 || form == 2) {
        // For forms 1 and 2, use all subjects
        result.marks = totalMarks;
        result.points = totalPoints;
      } else {
        // For forms 3 and 4, use the original logic with subject selection

        // Process group 1 - add all subjects
        let group1Marks = 0;
        let group1Points = 0;
        active_group_1.forEach((subjectId) => {
          if (record[subjectId] !== undefined) {
            const { grade, points } = getGradeAndPoints(
              record[subjectId],
              subjectId
            );
            group1Marks += record[subjectId] || 0;
            group1Points += points;
          }
        });

        // Process group 2 - add at least two highest
        let group2Marks = 0;
        let group2Points = 0;
        if (active_group_2.length > 0) {
          const group2Values = active_group_2
            .filter((subjectId) => record[subjectId] !== undefined)
            .map((subjectId) => ({
              subjectId,
              value: record[subjectId],
              ...getGradeAndPoints(record[subjectId], subjectId),
            }))
            .sort((a, b) => b.value - a.value);

          // Take at least two highest or all if less than two
          const toTake = Math.min(2, group2Values.length);
          for (let i = 0; i < toTake; i++) {
            const item = group2Values[i];
            group2Marks += item.value;
            group2Points += item.points;
          }
        }

        // Process group 3 - add at least one highest
        let group3Marks = 0;
        let group3Points = 0;
        if (active_group_3.length > 0) {
          const group3Values = active_group_3
            .filter((subjectId) => record[subjectId] !== undefined)
            .map((subjectId) => ({
              subjectId,
              value: record[subjectId],
              ...getGradeAndPoints(record[subjectId], subjectId),
            }))
            .sort((a, b) => b.value - a.value);

          // Take at least one highest
          if (group3Values.length > 0) {
            const item = group3Values[0];
            group3Marks += item.value;
            group3Points += item.points;
          }
        }

        // Process group 4 - add at least one highest
        let group4Marks = 0;
        let group4Points = 0;
        if (active_group_4.length > 0) {
          const group4Values = active_group_4
            .filter((subjectId) => record[subjectId] !== undefined)
            .map((subjectId) => ({
              subjectId,
              value: record[subjectId],
              ...getGradeAndPoints(record[subjectId], subjectId),
            }))
            .sort((a, b) => b.value - a.value);

          // Take at least one highest
          if (group4Values.length > 0) {
            const item = group4Values[0];
            group4Marks += item.value;
            group4Points += item.points;
          }
        }

        // Calculate totals for forms 3 and 4
        result.marks = group1Marks + group2Marks + group3Marks + group4Marks;
        result.points =
          group1Points + group2Points + group3Points + group4Points;
      }

      return result;
    });

    // Sort records by points in descending order
    processedRecords.sort((a, b) => b.points - a.points);

    // Calculate ranks with proper handling of ties
    let currentRank = 1;
    processedRecords.forEach((record, index) => {
      if (index === 0) {
        record.rank = 1;
      } else {
        if (record.points === processedRecords[index - 1].points) {
          record.rank = processedRecords[index - 1].rank;
        } else {
          record.rank = index + 1;
        }
      }
      currentRank = record.rank;
    });

    res.status(200).json(processedRecords);
  } catch (err) {
    next(createError(500, "Failed to process student marks", err));
  }
};

// Process Marksheet
export const procesMarkSheet = async (req, res, next) => {
  const { exam, form, stream } = req.body;

  try {

    if(!exam) return next(createError(400, "Invalid exam provided"));
    if(!form) return next(createError(400, "Invalid form provided"));
    if(!stream) return next(createError(400, "Invalid stream provided"));

    // if (!exam || !form || !stream) {
    //   return next(createError(400, "Invalid exam or form provided"));
    // }

    // Sanitize inputs
    const sanitizedExam = sanitizeStringVariables(exam);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedStream = sanitizeStringVariables(stream);

    const examTable = sanitizedExam;
    const subjectTable = `subjects`;

    // Step 1: Get school details including logo path
    const particularsQuery = "SELECT * FROM particulars WHERE id = 119";
    const particularsResult = await pool.query(particularsQuery);

    // Handle logo path - use default if not provided
    const logoPath = particularsResult.rows[0]?.logo_path
      ? path.join("../../../public", particularsResult.rows[0].logo_path)
      : path.join("../../../public/images/defaults/logo.webp");

    const schoolDetails = {
      schoolname: particularsResult.rows[0]?.schoolname || "",
      motto: particularsResult.rows[0]?.motto || "",
      address: particularsResult.rows[0]?.address || "",
      phone: particularsResult.rows[0]?.phone || "",
      exam: exam.replace(/_/g, " ").toUpperCase(),
      logoPath: logoPath,
    };

    // Step 2: Get active subject IDs
    const subjectsQuery = `SELECT id, init FROM ${subjectTable} WHERE status = 1 AND level = $1`;
    const subjectsResult = await pool.query(subjectsQuery, [form]);

    if (subjectsResult.rows.length === 0) {
      return next(createError(404, "No active subjects/learning areas found"));
    }

    const activeSubjects = subjectsResult.rows.map((row) => row.id);
    const subjectInitialsMap = {};
    subjectsResult.rows.forEach((row) => {
      subjectInitialsMap[row.id] = row.init;
    });

    // Step 3: Fetch students in the specified stream
    // Modified: Use students table with current_form and stream_id conditions
    const studentsQuery = `SELECT id, fname || ' ' || lname AS name FROM students WHERE current_form = $1 AND stream_id = $2::int`;
    const studentsResult = await pool.query(studentsQuery, [
      sanitizedForm,
      parseInt(sanitizedStream),
    ]);

    if (studentsResult.rows.length === 0) {
      return next(createError(404, "No students found in this stream"));
    }

    const studentsMap = {};
    const studentIds = studentsResult.rows.map((row) => row.id);
    studentsResult.rows.forEach((row) => {
      studentsMap[row.id] = row.name;
    });

    // Step 4: Skip actual fetching of subject marks, since we return all empty values
    // Instead, just prepare student data with blank subject fields

    const studentData = studentIds.map((studentId, index) => {
      const subjects = {};
      activeSubjects.forEach((subjectId) => {
        const init = subjectInitialsMap[subjectId];
        subjects[init] = " "; // <<< return empty value for every subject
      });

      return {
        sn: index + 1,
        admNo: studentId,
        name: studentsMap[studentId] || "Unknown",
        ...subjects,
      };
    });

    // Prepare final payload
    const response = {
      schoolDetails,
      studentData,
      subjectHeaders: Object.values(subjectInitialsMap),
    };

    // console.log(response)
    return response;
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// Process Mark for ALL FORM AND STREAM // THIS IS RETURNING DATA
export const StudentMarkList = async (req, res, next) => {
  try {
    const studentMarkResult = await studentReportMarks(req)
    const dataToFormat = studentMarkResult.studentResults;

    if (!dataToFormat || !Array.isArray(dataToFormat)) {
      return res.status(404).json({ message: "No student data found." });
    }

    // Determine the form from first student
    const form = dataToFormat[0]?.form;
    if (!form) throw createError(400, "Form not found in student data.");

    // Step 1: Get school details including logo path
    const particularsQuery = "SELECT * FROM particulars WHERE id = 119";
    const particularsResult = await pool.query(particularsQuery);

    // Handle logo path - use default if not provided
    const logoPath = particularsResult.rows[0]?.logo_path
      ? path.join("../../../public", particularsResult.rows[0].logo_path)
      : path.join("../../../public/images/defaults/logo.webp");

    const schoolDetails = {
      schoolname: particularsResult.rows[0]?.schoolname || "",
      motto: particularsResult.rows[0]?.motto || "",
      address: particularsResult.rows[0]?.address || "",
      phone: particularsResult.rows[0]?.phone || "",
      logoPath: logoPath,
    };

    // Fetch subjects for the form
    const query = `SELECT id, init FROM subjects WHERE status = 1 AND level = $1`;
    const { rows: subjectRows } = await pool.query(query, [form]);

    // Create a map of subject_id -> init
    const subjectMap = {};
    subjectRows.forEach((sub) => {
      subjectMap[sub.id] = sub.init;
    });

    // Transform each student
    const formattedStudents = dataToFormat.map((student, index) => {
      const subjectData = {};

      student.results?.forEach((subject) => {
        const code = parseInt(subject.code); // code like 101
        const init = subjectMap[code];

        if (init && subject.included) {
          const mark = subject.marks?.mark || 0;
          const grade = subject.marks?.grade || "E";
          subjectData[init] = `${mark} ${grade}`;
        }
      });

      return {
        sn: index + 1,
        id: student.id,
        name: student.name,
        stream_id: student.stream_id,
        stream: student.stream,
        subjects: subjectData,
        marks: parseInt(student.total_marks?.split("/")[0]) || 0,
        points: parseInt(student.total_points?.split("/")[0]) || 0,
        grade: student.ag_grade,
        stream_rank: parseInt(student.stream_position?.split("/")[0]) || 0,
        overal_rank: parseInt(student.overal_position?.split("/")[0]) || 0,
      };
    });

    const response = {
      examDetails : studentMarkResult.examDetails,
      schoolDetails,
      formattedStudents,
      subjectHeaders: [
        ...Object.values(subjectMap),
        "Mrks",
        "Pts",
        "Grd",
        "S.Rk",
        "O.Rk",
      ],
    };
    // res.status(200).json(response)
    return response;
  } catch (err) {
    next(err);
  }
};

// Send to front end processed DATA above // USE THIS FOR FRONTEND
export const StudentMarkAnalysis = async (req, res, next) => {
  try {
    const {form} = req.body
    // Get the raw mark list data
    const markList = await StudentMarkList(req);

    // Get active subjects from database
    const activeSubjects = await pool.query(
      `SELECT id, name, init FROM subjects WHERE status = 1 AND level = $1`, [form]
    );

    // Create a map of subject initials to full names
    const subjectMap = {};
    activeSubjects.rows.forEach((subject) => {
      subjectMap[subject.init] = {
        name: subject.name,
        id: subject.id,
      };
    });

    const isCBC = ![19, 20, 21, 22].includes(form)

    // Grade to points mapping
    const gradePoints = isCBC ? {
      BE: 1,
      ME: 2,
      AE : 3,
      EE : 4
    } : {
      A: 12,
      "A-": 11,
      "B+": 10,
      B: 9,
      "B-": 8,
      "C+": 7,
      C: 6,
      "C-": 5,
      "D+": 4,
      D: 3,
      "D-": 2,
      E: 1,
    };

    // Group students by stream
    const streams = {};
    markList.formattedStudents.forEach((student) => {
      if (!streams[student.stream]) {
        streams[student.stream] = [];
      }
      streams[student.stream].push(student);
    });

    // Initialize performance data structure
    const performanceData = [];

    // Process each active subject
    activeSubjects.rows.forEach((subject) => {
      const subjectCode = subject.init;
      const subjectName = subject.name;

      const subjectData = {
        code: subject.id.toString(),
        name: subjectName,
        init: subjectCode,
        optional: false, // You may need to adjust this based on your data
        instructor: "To be assigned", // You can modify this as needed
        streams: [],
        overallAvg: 0,
        rank: 0,
      };

      // Process each stream for this subject
      Object.keys(streams).forEach((streamName) => {
        const streamStudents = streams[streamName];
        const enrolment = streamStudents.length;

        const streamData = {
          name: streamName,
          enrolment: enrolment,
          grades: isCBC ? {
            BE : 0,
            AE : 0,
            ME : 0,
            EE : 0
          } : {
            A: 0,
            "A-": 0,
            "B+": 0,
            B: 0,
            "B-": 0,
            "C+": 0,
            C: 0,
            "C-": 0,
            "D+": 0,
            D: 0,
            "D-": 0,
            E: 0,
          },
          avgPoints: 0,
        };

        // Count grades for this subject in this stream
        let totalPoints = 0;
        streamStudents.forEach((student) => {
          if (student.subjects[subjectCode]) {
            const grade = student.subjects[subjectCode].split(" ")[1];
            streamData.grades[grade]++;
            totalPoints += gradePoints[grade];
          }
        });

        // Calculate average points for this stream
        if (enrolment > 0) {
          streamData.avgPoints = parseFloat(
            (totalPoints / enrolment).toFixed(2)
          );
        }

        subjectData.streams.push(streamData);
      });

      // Calculate overall average for this subject
      const totalPoints = subjectData.streams.reduce(
        (sum, stream) => sum + stream.avgPoints * stream.enrolment,
        0
      );
      const totalStudents = subjectData.streams.reduce(
        (sum, stream) => sum + stream.enrolment,
        0
      );

      if (totalStudents > 0) {
        subjectData.overallAvg = parseFloat(
          (totalPoints / totalStudents).toFixed(2)
        );
      }

      performanceData.push(subjectData);
    });

    // Calculate ranks based on overall averages
    performanceData.sort((a, b) => b.overallAvg - a.overallAvg);
    performanceData.forEach((subject, index) => {
      subject.rank = index + 1;
    });

    // Prepare the final response
    const response = {
      examDetails : markList.examDetails,
      schoolDetails: markList.schoolDetails,
      performanceData: performanceData,
      form : form
    };

    // res.status(200).json(response);
    return response
  } catch (err) {
    next(err);
  }
};

// Send to front end processed DATA above // USE THIS FOR FRONTEND
export const StudentMarkListReady = async (req, res, next) => {
  try {
    const markList = await StudentMarkList(req);
    console.log(markList)
    res.status(200).json(markList.formattedStudents);
  } catch (err) {
    next(err);
  }
};


// GET EXAMS ATTEMPTED BY STUDENT
export const StudentAttemptedExams = async (req, res, next) => {
  const { id } = req.body;

  // Validate input (security best practice)
  if (!id) {
    return next(createError(400, "Student ID not provided"));
  }

  try {
    // Use parameterized query to prevent SQL injection
    const query = `
      WITH student_info AS (
        SELECT id, year_of_enrolment, current_form
        FROM students 
        WHERE id = $1  -- Parameterized query for security
      )
      
      -- exam1 is always included
      SELECT exam_name, year, 'exam1' AS source_table
      FROM form_1_exams
      WHERE year BETWEEN
        (SELECT year_of_enrolment FROM student_info)
        AND EXTRACT(YEAR FROM CURRENT_DATE)

      UNION ALL

      -- include exam2 if form ≥ 2
      SELECT exam_name, year, 'exam2' AS source_table
      FROM form_2_exams
      WHERE (SELECT current_form FROM student_info) >= 2
        AND year BETWEEN
          (SELECT year_of_enrolment FROM student_info)
          AND EXTRACT(YEAR FROM CURRENT_DATE)

      UNION ALL

      -- include exam3 if form ≥ 3
      SELECT exam_name, year, 'exam3' AS source_table
      FROM form_3_exams
      WHERE (SELECT current_form FROM student_info) >= 3
        AND year BETWEEN
          (SELECT year_of_enrolment FROM student_info)
          AND EXTRACT(YEAR FROM CURRENT_DATE)

      UNION ALL

      -- include exam4 if form = 4
      SELECT exam_name, year, 'exam4' AS source_table
      FROM form_4_exams
      WHERE (SELECT current_form FROM student_info) = 4
        AND year BETWEEN
          (SELECT year_of_enrolment FROM student_info)
          AND EXTRACT(YEAR FROM CURRENT_DATE)
    `;

    // Execute query with parameter (using a DB client like pg, mysql2, etc.)
    const result = await pool.query(query, [id]); // Assuming 'pool' is your database connection

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No exam records found for this student" });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    next(err); // Pass error to Express error handler
  }
};
