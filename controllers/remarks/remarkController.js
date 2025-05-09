import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Predefined list of allowed tables to prevent SQL injection
const ALLOWED_TABLES = new Set([
  "comments",
  "principal_remark",
  "classteacher_remark",
]);

// Common validation patterns
const TABLE_NAME_PATTERN = /^[a-z0-9_]+$/i;
const ID_PATTERN = /^[1-9]\d*$/;

const validateRequiredFields = (fields) => {
  return Object.entries(fields)
    .filter(
      ([_, value]) => value === undefined || value === null || value === ""
    )
    .map(([key]) => key);
};

const validateContentType = (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json content-type"));
  }
  next();
};

// Get all Remarks
export const getAllRemarks = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { item } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ item });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate input
    const sanitizedItem = sanitizeStringVariables(item);
    if (!TABLE_NAME_PATTERN.test(sanitizedItem)) {
      return next(createError(400, "Invalid item format"));
    }

    // Check against allowed tables
    if (!ALLOWED_TABLES.has(sanitizedItem)) {
      return next(createError(400, "Invalid item specified"));
    }

    // Use parameterized query for table name (where supported) or whitelist approach
    const result = await pool.query({
      text: `SELECT * FROM ${sanitizedItem}`,
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No records found for the specified item"));
    }

    res.status(200).json(result.rows);
  } catch (err) {
    // Handle specific database errors
    if (err.code === "42P01") {
      // Table does not exist
      return next(createError(404, "The specified item does not exist"));
    }

    // Propagate other errors
    next(
      createError(500, "Failed to retrieve remarks", { originalError: err })
    );
  }
};

// Get single item
export const getRemark = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { item, id } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ item, id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedItem = sanitizeStringVariables(item);
    if (!TABLE_NAME_PATTERN.test(sanitizedItem)) {
      return next(createError(400, "Invalid item format"));
    }

    if (!ID_PATTERN.test(id)) {
      return next(createError(400, "Invalid ID format"));
    }

    // Check against allowed tables
    if (!ALLOWED_TABLES.has(sanitizedItem)) {
      return next(createError(400, "Invalid item specified"));
    }

    // Parameterized query to prevent SQL injection
    const result = await pool.query({
      text: `SELECT * FROM ${sanitizedItem} WHERE id = $1`,
      values: [id],
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No record found for the specified ID"));
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      return next(createError(404, "The specified item does not exist"));
    }

    next(createError(500, "Failed to retrieve remark", { originalError: err }));
  }
};

// Update Remark
export const updateRemark = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { item, comment } = req.body;
    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({ item, comment, id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedItem = sanitizeStringVariables(item);

    if (!TABLE_NAME_PATTERN.test(sanitizedItem)) {
      return next(createError(400, "Invalid item format"));
    }

    if (!ID_PATTERN.test(id)) {
      return next(createError(400, "Invalid ID format"));
    }

    const cleanedComment = comment.trim()

    // Additional comment validation
    if (cleanedComment.length > 500) {
      return next(
        createError(400, "Comment exceeds maximum length of 500 characters")
      );
    }

    // Check against allowed tables
    if (!ALLOWED_TABLES.has(sanitizedItem)) {
      return next(createError(400, "Invalid item specified"));
    }

    // Parameterized query to prevent SQL injection
    const result = await pool.query({
      text: `UPDATE ${sanitizedItem} 
                   SET comment = $1
                   WHERE id = $2 
                   RETURNING *`,
      values: [cleanedComment, id],
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No record found with the specified ID"));
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {

    if (err.code === "42P01") {
      return next(createError(404, "The specified item does not exist"));
    }

    next(createError(500, "Failed to update remark", { originalError: err }));
  }
};
