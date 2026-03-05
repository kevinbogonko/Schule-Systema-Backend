import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";

export const getSelectivePerStream = async (req, res, next) => {
  const { year, form, stream_id, subject } = req.body;
  console.log(year, form, stream_id, subject);

  try {
    // Validate required parameters
    if (!year || !form || !stream_id || !subject) {
      return next(createError(400, "Missing required parameters!"));
    }

    // Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedSubject = sanitizeStringVariables(subject);

    // Validate form input
    const validFormPattern = /^(-1|[0-9]|1[0-9]|2[0-2])$/;
    if (!validFormPattern.test(sanitizedForm)) {
      return next(createError(400, "Invalid form!"));
    }

    // Validate stream_id is numeric
    const validIdPattern = /^[0-9]+$/;
    if (!validIdPattern.test(stream_id)) {
      return next(createError(400, "Invalid Stream ID! Must be numeric"));
    }

    // Validate subject name
    const validSubjectPattern = /^[0-9]+$/;
    if (!validSubjectPattern.test(sanitizedSubject)) {
      return next(createError(400, "Invalid subject name!"));
    }

    // Execute query with proper JOIN to get student names
    const result = await pool.query(
      `SELECT s.id, s.student_id, 
              CONCAT(st.fname, ' ', st.lname) AS name, 
              s."${sanitizedSubject}" 
       FROM selectives s
       JOIN students st ON s.student_id = st.id
       WHERE s.year = $1 AND s.form = $2 AND s.stream_id = $3`,
      [sanitizedYear, sanitizedForm, stream_id]
    );

    if (result.rows.length === 0) {
      return next(
        createError(404, "No students found for the specified criteria")
      );
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err)
    console.error("Error in getSelectivePerStream:", err);
    next(createError(500, "Failed to retrieve selective students"));
  }
};

export const getSelectiveForAllStreams = async (req, res, next) => {
  const { year, form, subject } = req.body;

  try {
    // Validate required parameters
    if (!year || !form || !subject) {
      return next(createError(400, "Missing required parameters!"));
    }

    // Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedSubject = sanitizeStringVariables(subject);

    // Validate form input
    const validFormPattern = /^(-1|[0-9]|1[0-9]|2[0-2])$/;
    if (!validFormPattern.test(sanitizedForm)) {
      return next(createError(400, "Invalid form!"));
    }

    // Validate subject name
    const validSubjectPattern = /^[0-9]+$/;
    if (!validSubjectPattern.test(sanitizedSubject)) {
      return next(createError(400, "Invalid subject name!"));
    }

    // Execute query with proper JOIN to get student names
    const result = await pool.query(
      `SELECT s.id, s.student_id, 
              CONCAT(st.fname, ' ', st.lname) AS name, 
              s."${sanitizedSubject}" 
       FROM selectives s
       JOIN students st ON s.student_id = st.id
       WHERE s.year = $1 AND s.form = $2`,
      [sanitizedYear, sanitizedForm]
    );

    if (result.rows.length === 0) {
      return next(
        createError(404, "No students found for the specified criteria")
      );
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err)
    console.error("Error in getSelectiveForAllStreams:", err);
    next(createError(500, "Failed to retrieve selective students"));
  }
};
