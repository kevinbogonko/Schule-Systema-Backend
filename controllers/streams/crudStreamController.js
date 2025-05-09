import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Constants for validation
const ALLOWED_FORMS = ["1", "2", "3", "4"];
const STREAM_NAME_MAX_LENGTH = 50;
const YEAR_PATTERN = /^(20)\d{2}$/;
const ID_PATTERN = /^[1-9]\d*$/;
const TEACHER_ID_PATTERN = /^[A-Za-z0-9]{1,25}$/;
const NAME_PATTERN = /^[A-Za-z0-9\s\-]+$/;

const validateRequiredFields = (fields) => {
  return Object.entries(fields)
    .filter(
      ([_, value]) => value === undefined || value === null || value === ""
    )
    .map(([key]) => key);
};

const validateContentType = (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Content-Type must be application/json"));
  }
  next();
};

const getStreamsTableName = (form) => {
  if (!ALLOWED_FORMS.includes(form)) {
    throw createError(
      400,
      `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
    );
  }
  return `form_${form}_streams`;
};

// Add Stream Controller
export const addStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { form, stream_name, year, teacher_id } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({
      form,
      stream_name,
      year,
      teacher_id,
    });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedStreamName = sanitizeStringVariables(stream_name).trim();
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedTeacherId = sanitizeStringVariables(teacher_id);

    // Validate inputs
    if (!ALLOWED_FORMS.includes(sanitizedForm)) {
      return next(
        createError(
          400,
          `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
        )
      );
    }

    if (!YEAR_PATTERN.test(sanitizedYear)) {
      return next(
        createError(400, "Invalid year format. Expected format: YYYY")
      );
    }

    if (!NAME_PATTERN.test(sanitizedStreamName)) {
      return next(createError(400, "Stream name contains invalid characters"));
    }

    if (sanitizedStreamName.length > STREAM_NAME_MAX_LENGTH) {
      return next(
        createError(
          400,
          `Stream name exceeds maximum length of ${STREAM_NAME_MAX_LENGTH} characters`
        )
      );
    }

    if (!TEACHER_ID_PATTERN.test(sanitizedTeacherId)) {
      return next(createError(400, "Invalid teacher ID format"));
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Check if stream already exists for this year
    const existingStream = await pool.query({
      text: `SELECT 1 FROM ${streamTable} 
            WHERE stream_name = $1 AND year = $2`,
      values: [sanitizedStreamName, sanitizedYear],
    });

    if (existingStream.rows.length > 0) {
      return next(
        createError(
          409,
          "A stream with this name already exists for the specified year"
        )
      );
    }

    // Insert new stream
    const result = await pool.query({
      text: `INSERT INTO ${streamTable} 
                   (stream_name, year, teacher_id)
                   VALUES ($1, $2, $3) 
                   RETURNING *`,
      values: [sanitizedStreamName, sanitizedYear, sanitizedTeacherId],
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {

    if (err.code === "23505") {
      // Unique violation
      return next(createError(409, "Stream with these details already exists"));
    }

    next(createError(500, "Failed to create stream", { originalError: err }));
  }
};

// Get All Streams
export const getAllStreams = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { year, form } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ year, form });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    if (!ALLOWED_FORMS.includes(sanitizedForm)) {
      return next(
        createError(
          400,
          `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
        )
      );
    }

    if (!YEAR_PATTERN.test(sanitizedYear)) {
      return next(
        createError(400, "Invalid year format. Expected format: YYYY")
      );
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Query streams
    const result = await pool.query({
      text: `SELECT * FROM ${streamTable} 
                   WHERE year = $1 
                   ORDER BY stream_name`,
      values: [sanitizedYear],
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No streams found for the specified year"));
    }

    res.status(200).json(result.rows);
  } catch (err) {

    if (err.code === "42P01") {
      // Table does not exist
      return next(
        createError(404, "No streams table found for the specified form")
      );
    }

    next(
      createError(500, "Failed to retrieve streams", { originalError: err })
    );
  }
};

// Get Single Stream
export const getStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { id, form } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ id, form });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedForm = sanitizeStringVariables(form);

    if (!ALLOWED_FORMS.includes(sanitizedForm)) {
      return next(
        createError(
          400,
          `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
        )
      );
    }

    if (!ID_PATTERN.test(id)) {
      return next(createError(400, "Invalid stream ID format"));
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Query stream
    const result = await pool.query({
      text: `SELECT * FROM ${streamTable} 
                   WHERE id = $1`,
      values: [id],
    });

    if (result.rows.length === 0) {
      return next(createError(404, "Stream not found"));
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {

    if (err.code === "42P01") {
      return next(
        createError(404, "No streams table found for the specified form")
      );
    }

    next(createError(500, "Failed to retrieve stream", { originalError: err }));
  }
};

// Update Stream Controller
export const updateStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { form, stream_name, year, teacher_id } = req.body;
    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({
      form,
      stream_name,
      year,
      teacher_id,
      id,
    });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedStreamName = sanitizeStringVariables(stream_name).trim();
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedTeacherId = sanitizeStringVariables(teacher_id);

    // Validate inputs
    if (!ALLOWED_FORMS.includes(sanitizedForm)) {
      return next(
        createError(
          400,
          `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
        )
      );
    }

    if (!YEAR_PATTERN.test(sanitizedYear)) {
      return next(
        createError(400, "Invalid year format. Expected format: YYYY")
      );
    }

    if (!NAME_PATTERN.test(sanitizedStreamName)) {
      return next(createError(400, "Stream name contains invalid characters"));
    }

    if (sanitizedStreamName.length > STREAM_NAME_MAX_LENGTH) {
      return next(
        createError(
          400,
          `Stream name exceeds maximum length of ${STREAM_NAME_MAX_LENGTH} characters`
        )
      );
    }

    if (!TEACHER_ID_PATTERN.test(sanitizedTeacherId)) {
      return next(createError(400, "Invalid teacher ID format"));
    }

    if (!ID_PATTERN.test(id)) {
      return next(createError(400, "Invalid stream ID format"));
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Check if stream exists
    const existingStream = await pool.query({
      text: `SELECT 1 FROM ${streamTable} WHERE id = $1`,
      values: [id],
    });

    if (existingStream.rows.length === 0) {
      return next(createError(404, "Stream not found"));
    }

    // Check for name conflict with other streams
    const nameConflict = await pool.query({
      text: `SELECT 1 FROM ${streamTable} 
                   WHERE stream_name = $1 AND year = $2 AND id != $3`,
      values: [sanitizedStreamName, sanitizedYear, id],
    });

    if (nameConflict.rows.length > 0) {
      return next(
        createError(
          409,
          "Another stream with this name already exists for the specified year"
        )
      );
    }

    // Update stream
    const result = await pool.query({
      text: `UPDATE ${streamTable} 
                   SET stream_name = $1, year = $2, teacher_id = $3
                   WHERE id = $4 
                   RETURNING *`,
      values: [sanitizedStreamName, sanitizedYear, sanitizedTeacherId, id],
    });

    res.status(200).json(result.rows[0]);
  } catch (err) {

    if (err.code === "23505") {
      // Unique violation
      return next(createError(409, "Stream with these details already exists"));
    }

    next(createError(500, "Failed to update stream", { originalError: err }));
  }
};

// Delete Stream
export const deleteStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { form } = req.body;
    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({ form, id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedForm = sanitizeStringVariables(form);

    if (!ALLOWED_FORMS.includes(sanitizedForm)) {
      return next(
        createError(
          400,
          `Invalid form. Allowed values: ${ALLOWED_FORMS.join(", ")}`
        )
      );
    }

    if (!ID_PATTERN.test(id)) {
      return next(createError(400, "Invalid stream ID format"));
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Check if stream exists
    const existingStream = await pool.query({
      text: `SELECT 1 FROM ${streamTable} WHERE id = $1`,
      values: [id],
    });

    if (existingStream.rows.length === 0) {
      return next(createError(404, "Stream not found"));
    }

    // Delete stream
    const result = await pool.query({
      text: `DELETE FROM ${streamTable} 
                   WHERE id = $1 
                   RETURNING *`,
      values: [id],
    });

    if (result.rows.length > 0) {
      res.status(204).json({
        success: true,
        message: "Stream deleted successfully",
        deletedStream: result.rows[0],
      });
    } else {
      next(createError(404, "Stream not found"));
    }
  } catch (err) {
    if (err.code === "23503") {
      // Foreign key violation
      return next(
        createError(
          400,
          "Cannot delete stream as it is referenced by other records"
        )
      );
    }

    next(createError(500, "Failed to delete stream", { originalError: err }));
  }
};
