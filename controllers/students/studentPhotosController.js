import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";


export const getStudentPhoto = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, id } = req.body;
  
    try {
      // Validate input presence
      if (!id || !form) {
        return next(
          createError(400, "Missing required parameters: form and stream id")
        );
      }

      // Sanitize inputs
      const sanitizedForm = sanitizeStringVariables(form);

      // Validate form input against strict pattern
      const validFormPattern = /^[a-z0-9_]{1,50}$/i; // Case insensitive, alphanumeric + underscore, length limit
      if (!validFormPattern.test(sanitizedForm)) {
        return next(createError(400, "Invalid Form input!"));
      }

      // Validate ID input against strict pattern
      const validYearPattern = /^[0-9]{1,15}$/; // Only numbers, length limit
      if (!validYearPattern.test(id)) {
        return next(createError(400, "Invalid Student ID!"));
      }

      // Construct table name safely
      const studentImageTable = `student_form_${sanitizedForm}_images`;

      // Validate table name pattern to prevent SQL injection
      const validTablePattern = /^student_form_[a-z0-9_]_images{1,50}$/i;
      if (!validTablePattern.test(studentImageTable)) {
        return next(createError(400, "Invalid table name format"));
      }

      // Query the database with parameterized query
      const queryText = `SELECT path FROM ${studentImageTable} WHERE id = $1`;
      const result = await pool.query(queryText, [id]);

      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res
          .status(200)
          .json({
            path: "/images/defaults/user_p.webp",
          });
        // next(createError(404, "No record found."));
      }

    }catch(err){
      // Handle specific database errors
      if (err.code === "42P01") {
        // Table does not exist
        return next(createError(404, "Requested data not found"));
      }

      next(createError(500, err.message || "Internal server error"));
    }

}
  