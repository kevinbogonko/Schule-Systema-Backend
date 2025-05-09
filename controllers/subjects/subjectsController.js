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