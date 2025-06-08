import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";


export const getActiveSubjects = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form } = req.body;
  
    try {
      // Validate input presence
      if (!form) {
        return next(createError(400, 'Missing required parameters: form'));
      }

      const subjectsTable = `subjects_form_${form}`

       // Query the database with parameterized query
      const queryText = `SELECT * FROM ${subjectsTable} WHERE status = 1`;
      const result = await pool.query(queryText);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        next(createError(404, 'No record found. Please Add.')); //Subjects
      }

    }catch(err){
      // Handle specific database errors
      if (err.code === '42P01') { // Table does not exist
        return next(createError(404, 'Requested data not found'));
      }
      
      next(createError(500, err || 'Internal server error'));
    }
}

// All Subjects Active and Inactive
export const getAllSubjects = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form } = req.body;
  
    try {
      // Validate input presence
      if (!form) {
        return next(createError(400, 'Missing required parameters: form'));
      }

      const subjectsTable = `subjects_form_${form}`

       // Query the database with parameterized query
      const queryText = `SELECT * FROM ${subjectsTable}`;
      const result = await pool.query(queryText);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        next(createError(404, 'No record found. Please Add.')); //Subjects
      }

    }catch(err){
      // Handle specific database errors
      if (err.code === '42P01') { // Table does not exist
        return next(createError(404, 'Requested data not found'));
      }
      
      next(createError(500, err || 'Internal server error'));
    }
}

// Update Subject status
export const updateSubjectStatus = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { form, updates } = req.body;

    // Validate form
    if (!form || typeof form !== "string" || !/^[0-9]+$/.test(form)) {
      return next(createError(400, "Invalid form value"));
    }

    // Validate updates
    if (!Array.isArray(updates) || updates.length === 0) {
      return next(createError(400, "Invalid updates array"));
    }

    const ids = [];
    const statuses = [];
    const selectiveStatuses = [];

    for (const update of updates) {
      if (
        typeof parseInt(update.id) !== "number" ||
        !Number.isInteger(parseInt(update.id)) ||
        update.id <= 0 ||
        (update.status !== 0 && update.status !== 1) ||
        (update.isSelective !== 0 && update.isSelective !== 1)
      ) {
        return next(createError(400, "Invalid update data"));
      }
      ids.push(update.id);
      statuses.push(update.status);
      selectiveStatuses.push(update.isSelective);
    }

    // Sanitize table name
    const subjectTable = `subjects_form_${form}`;

    // Ensure the table exists
    const tableCheck = await client.query(`SELECT to_regclass($1) AS exists`, [
      subjectTable,
    ]);

    if (!tableCheck.rows[0].exists) {
      return next(createError(400, `Table ${subjectTable} does not exist`));
    }

    await client.query("BEGIN");

    // Update query for both status and isSelective
    const query = `
      UPDATE ${subjectTable}
      SET 
        status = data.status,
        isselective = data.isselective
      FROM (
        SELECT 
          unnest($1::int[]) AS id, 
          unnest($2::int[]) AS status,
          unnest($3::int[]) AS isselective
      ) AS data
      WHERE ${subjectTable}.id = data.id
    `;

    await client.query(query, [ids, statuses, selectiveStatuses]);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Subject status update failed:", error);
    return next(createError(500, "Failed to update subjects"));
  } finally {
    client.release();
  }
};

// Selective subjects
export const selectiveSubjects = async (req, res, next) => {
  const { form } = req.body;

  try {
    if (!form)
      return next(createError(400, "Missing required parameters!"));

    const sanitizedForm = sanitizeStringVariables(form);

    const validFormPattern = /^[a-z0-9_]+$/i;
    if (!validFormPattern.test(sanitizedForm))
      return next(createError(400, "Invalid Form input!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const subjectTable = `subjects_form_${sanitizedForm}`;

    const result = await pool.query(
      `SELECT id, name FROM ${subjectTable} 
             WHERE status = 1 AND isselective = 1`,
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      next(createError(404, "Selective Subjects not Found"));
    }
  } catch (err) {
    next(err);
  }
};

// Update Subject status
export const updateSelectiveSubjects = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { year, form, updates } = req.body;

    // Validate year
    if (!year || typeof year !== "string" || !/^[0-9]+$/.test(year)) {
      return next(createError(400, "Invalid year value"));
    }

    // Validate form
    if (!form || typeof form !== "string" || !/^[0-9]+$/.test(form)) {
      return next(createError(400, "Invalid form value"));
    }

    // Validate updates
    if (!Array.isArray(updates) || updates.length === 0) {
      return next(createError(400, "Invalid updates array"));
    }

    // Validate each update object
    for (const update of updates) {
      if (
        typeof update.id !== "number" ||
        !Number.isInteger(update.id) ||
        update.id <= 0
      ) {
        return next(createError(400, "Invalid Record ID in updates"));
      }

      // Validate that at least one subject column exists and has valid value (0 or 1)
      let hasValidSubject = false;
      for (const key in update) {
        if (key !== "id" && /^[0-9]+$/.test(key)) {
          if (update[key] !== 0 && update[key] !== 1) {
            return next(createError(400, `Invalid value for subject ${key}`));
          }
          hasValidSubject = true;
        }
      }

      if (!hasValidSubject) {
        return next(
          createError(400, "No valid subject columns found in update")
        );
      }
    }

    // Sanitize table name
    const selectiveTable = `selectives`;

    // Ensure the table exists
    const tableCheck = await client.query(`SELECT to_regclass($1) AS exists`, [
      selectiveTable,
    ]);

    if (!tableCheck.rows[0].exists) {
      return next(createError(400, `Table ${selectiveTable} does not exist`));
    }

    await client.query("BEGIN");

    // Build and execute individual UPDATE statements for each student
    for (const update of updates) {
      const studentId = update.id;
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      // Build SET clauses for each subject
      for (const key in update) {
        if (key !== "id") {
          // Double quote the column name to handle numeric column names
          setClauses.push(`"${key}" = $${paramIndex}`);
          values.push(update[key]);
          paramIndex++;
        }
      }

      // Add the WHERE condition
      values.push(studentId);

      const query = `
        UPDATE ${selectiveTable}
        SET ${setClauses.join(", ")}
        WHERE id = $${paramIndex}
      `;

      await client.query(query, values);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Selective subjects update failed:", error);
    return next(createError(500, "Failed to update selective subjects"));
  } finally {
    client.release();
  }
};

