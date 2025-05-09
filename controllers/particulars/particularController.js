import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

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
export const getParticulars = async (req, res, next) => {
  try {
    const query = {
      text: "SELECT * FROM particulars LIMIT 1",
    };

    const result = await pool.query(query);

    if (!result.rows || result.rows.length === 0) {
      return next(createError(404, "No particulars found"));
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      return next(createError(404, "Particulars table not found"));
    }
    if (err.code === "ECONNREFUSED") {
      return next(createError(503, "Database service unavailable"));
    }
    return next(createError(500, "Failed to retrieve particulars data"));
  }
};

// UPDATE particulars
export const updateParticulars = async (req, res, next) => {
  try {
    // Validate content-type
    validateContentType(req);

    let { schoolname, motto, email, phone, address, website } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({
      schoolname,
      motto,
      email,
      phone,
      address,
    });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    const query = {
      text: `
        UPDATE particulars
        SET 
          schoolname = $1,
          motto = $2,
          phone = $3,
          email = $4,
          address = $5,
          website = $6
        WHERE id = $7
        RETURNING *;
      `,
      values: [schoolname, motto, phone, email, address, website || null, 119],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return next(createError(404, "No record found with the specified ID"));
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      return next(createError(404, "Particulars table not found"));
    }
    next(
      createError(500, "Failed to update particulars", { originalError: err })
    );
  }
};
