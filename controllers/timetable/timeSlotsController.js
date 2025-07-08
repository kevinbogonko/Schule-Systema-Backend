import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

export const getTimeSlots = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, term, utility } = req.body;

  try {
    // Validate input presence
    if (!year || !term || !utility) {
      return next(createError(400, "Missing required parameters"));
    }

    // Sanitize inputs to prevent SQL injection
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedUtility = sanitizeStringVariables(utility);

    // Validate sanitized inputs are not empty
    if (!sanitizedYear || !sanitizedTerm || !sanitizedUtility) {
      return next(createError(400, "Invalid input parameters"));
    }

    // Use parameterized query to prevent SQL injection
    const query = `
            SELECT * 
            FROM timeslots 
            WHERE year = $1 
            AND term = $2 
            AND utility = $3
        `;

    const { rows } = await pool.query(query, [
      sanitizedYear,
      sanitizedTerm,
      sanitizedUtility,
    ]);

    if (rows.length === 0) {
      return next(
        createError(404, "No time slots found for the given criteria")
      );
    }

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

export const updateTimeSlots = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, term, utility, timeSlots } = req.body;

  try {
    // Validate required input presence
    if (!year || !term || !utility || !timeSlots) {
      return next(createError(400, "Missing required parameters"));
    }

    // Validate timeSlots is an array and not empty
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return next(createError(400, "timeSlots must be a non-empty array"));
    }

    // Validate and sanitize utility
    const sanitizedUtility = utility.toLowerCase();
    if (!["d", "mr", "er"].includes(sanitizedUtility)) {
      return next(createError(400, "Utility must be one of: Day Schedule (d), Morning Remedial (mr), Evening Remedial (er)"));
    }

    // Validate year is a positive integer
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return next(
        createError(400, "Year must be an integer between 2000 and 2100")
      );
    }

    // Validate term is a positive integer (assuming terms are 1-4)
    if (!Number.isInteger(term) || term < 1 || term > 3) {
      return next(createError(400, "Term must be an integer between 1 and 3"));
    }

    // Validate each time slot object
    for (const slot of timeSlots) {
      if (!slot.start || !slot.end || !slot.category || !slot.day_cluster_id) {
        return next(
          createError(
            400,
            "Each time slot must have start time, end time, event category, and day cluster identifier"
          )
        );
      }

      // Validate time format (simple check for HH:MM format)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
        return next(
          createError(400, "Start and end times must be in HH:MM format")
        );
      }

      // Validate day_cluster_id is a positive integer
      if (!Number.isInteger(slot.day_cluster_id) || slot.day_cluster_id <= 0) {
        return next(
          createError(400, "day_cluster_id must be a positive integer")
        );
      }

      // Sanitize category
      slot.category = sanitizeStringVariables(slot.category.toUpperCase());
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Delete existing time slots for this year, term, utility and day_cluster_id
      const deleteQuery = `
        DELETE FROM timeslots 
        WHERE year = $1 
        AND term = $2 
        AND utility = $3 
        AND day_cluster_id = ANY($4::int[])
      `;

      const dayClusterIds = timeSlots.map((slot) => slot.day_cluster_id);
      await client.query(deleteQuery, [
        year,
        term,
        sanitizedUtility,
        dayClusterIds,
      ]);

      // Insert new time slots
      const insertQuery = `
        INSERT INTO timeslots(
          year, term, lesson_id, starts, ends, category, utility, day_cluster_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      let lessonIdCounter = 1
      for (const slot of timeSlots) {
        await client.query(insertQuery, [
          year,
          term,
          // slot.lesson_id || null,
          lessonIdCounter++,
          slot.start,
          slot.end,
          slot.category,
          sanitizedUtility,
          slot.day_cluster_id,
        ]);
      }

      await client.query("COMMIT");
      res.status(200).json({ message: "Time slots updated successfully" });
    } catch (err) {
      console.log(err)
      await client.query("ROLLBACK");
      next(createError(500, "Database error occurred", err));
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};
