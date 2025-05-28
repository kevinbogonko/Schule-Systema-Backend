import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
// import { sanitizeStringVariables } from "../../utils/sanitizeString.js";


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

    console.log(updates)

    const ids = [];
    const statuses = [];

    for (const update of updates) {
      if (
        typeof parseInt(update.id) !== "number" ||
        !Number.isInteger(parseInt(update.id)) ||
        update.id <= 0 ||
        (update.status !== 0 && update.status !== 1)
      ) {
        return next(createError(400, "Invalid update data"));
      }
      ids.push(update.id);
      statuses.push(update.status);
    }

    // Sanitize table name
    const subjectTable = `subjects_form_${form}`;

    // Ensure the table exists (optional but safer)
    const tableCheck = await client.query(
      `
      SELECT to_regclass($1) AS exists
    `,
      [subjectTable]
    );

    if (!tableCheck.rows[0].exists) {
      return next(createError(400, `Table ${subjectTable} does not exist`));
    }

    await client.query("BEGIN");

    // Use parameterized query with dynamic table (safe since form is validated)
    const query = `
      UPDATE ${subjectTable}
      SET status = data.status
      FROM (
        SELECT 
          unnest($1::int[]) AS id, 
          unnest($2::int[]) AS status
      ) AS data
      WHERE ${subjectTable}.id = data.id
    `;

    await client.query(query, [ids, statuses]);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    // console.error("Subject status update failed:", error);
    return next(createError(500, "Failed to update subjects"));
  } finally {
    client.release();
  }
};