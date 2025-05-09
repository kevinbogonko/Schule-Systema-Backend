import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
// import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

export const getStaffPhoto = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { id } = req.body;

  try {
    // Validate input presence
    if (!id) {
      return next(
        createError(400, "Missing required parameters: teacher id")
      );
    }

    // Validate ID input against strict pattern
    const validIdPattern = /^[0-9]{1,15}$/; // Only numbers, length limit
    if (!validIdPattern.test(id)) {
      return next(createError(400, "Invalid teacher ID!"));
    }

    // Construct table name safely
    const teacherImageTable = `staff_images`;

    // Query the database with parameterized query
    const queryText = `SELECT path FROM ${teacherImageTable} WHERE id = $1`;
    const result = await pool.query(queryText, [id]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(200).json({
        path: "/images/defaults/user_p.webp",
      });
      // next(createError(404, "No record found."));
    }
  } catch (err) {
    // Handle specific database errors
    if (err.code === "42P01") {
      // Table does not exist
      return next(createError(404, "Requested data not found"));
    }

    next(createError(500, err.message || "Internal server error"));
  }
};
