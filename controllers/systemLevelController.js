import pool from "../config/db_connection.js";
import { createError } from "../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../utils/sanitizeString.js";

// Utility: Validate required fields
const validateRequiredFields = (fields) => {
  return Object.entries(fields)
    .filter(
      ([_, value]) => value === undefined || value === null || value === ""
    )
    .map(([key]) => key);
};

// Middleware-style content-type validation
const validateContentType = (req) => {
  if (!req.is("application/json")) {
    throw createError(415, "Expected application/json content-type");
  }
};

// GET particulars
export const getSystemLevels = async (req, res, next) => {
  try {
    const query = {
      text: "SELECT * FROM system_levels",
    };

    const result = await pool.query(query);

    if (!result.rows || result.rows.length === 0) {
      return next(createError(404, "No system level found"));
    }

    res.status(200).json(result.rows);
  } catch (err) {
    if (err.code === "42P01") {
      return next(createError(404, "System Levels table not found"));
    }
    if (err.code === "ECONNREFUSED") {
      return next(createError(503, "Database service unavailable"));
    }
    return next(createError(500, "Failed to retrieve System Levels data"));
  }
};

// UPDATE particulars
export const updateSystemLevels = async (req, res, next) => {
  try {
    // 1. Validate content-type
    validateContentType(req);

    /**
     * Expected req.body example:
     * { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0 }
     * where key = row id, value = status
     */
    const payload = req.body;

    // 2. Ensure payload is a valid object
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return next(createError(400, "Invalid payload format"));
    }

    // 3. Convert payload into entries
    const entries = Object.entries(payload);

    if (entries.length === 0) {
      return next(createError(400, "No system levels provided"));
    }

    // 4. Start a transaction
    await pool.query("BEGIN");

    const updatedRows = [];

    // 5. Update each system level by id
    for (const [id, status] of entries) {
      const query = {
        text: `
          UPDATE system_levels
          SET status = $1
          WHERE id = $2
          RETURNING *;
        `,
        values: [Number(status), Number(id)],
      };

      const result = await pool.query(query);

      if (result.rows.length === 0) {
        await pool.query("ROLLBACK");
        return next(createError(404, `No system level found with id ${id}`));
      }

      updatedRows.push(result.rows[0]);
    }

    // 6. Commit transaction
    await pool.query("COMMIT");

    // 7. Respond with updated rows
    res.status(200).json({
      message: "System levels updated successfully",
      data: updatedRows,
    });
  } catch (err) {
    // 8. Rollback on error
    await pool.query("ROLLBACK");

    if (err.code === "42P01") {
      return next(createError(404, "System Levels table not found"));
    }

    next(
      createError(500, "Failed to update system levels", {
        originalError: err,
      })
    );
  }
};
