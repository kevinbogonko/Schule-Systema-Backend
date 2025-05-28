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
  return `streams`;
};

// Add Stream Controller
export const addStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { form, stream_id, teacher_id, year } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({
      form,
      stream_id,
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
    const sanitizedStreamId = sanitizeStringVariables(stream_id).trim();
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

    if (!TEACHER_ID_PATTERN.test(sanitizedTeacherId)) {
      return next(createError(400, "Invalid teacher ID format"));
    }

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Check if stream already exists for this year
    const existingStream = await pool.query({
      text: `SELECT 1 FROM ${streamTable} 
            WHERE stream_id = $1 AND form = $2 AND year = $3`,
      values: [sanitizedStreamId, sanitizedForm, sanitizedYear],
    });

    if (existingStream.rows.length > 0) {
      return next(
        createError(
          409,
          "A stream record already exists"
        )
      );
    }

    // Insert new stream
    const result = await pool.query({
      text: `INSERT INTO ${streamTable} 
                   (stream_id, form, teacher_id, year)
                   VALUES ($1, $2, $3, $4) 
                   RETURNING *`,
      values: [sanitizedStreamId, sanitizedForm, sanitizedTeacherId, sanitizedYear],
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

    const { form, year } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ form, year });
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

    // Get table name
    const streamTable = getStreamsTableName(sanitizedForm);

    // Query streams
    const result = await pool.query({
      text: `SELECT s.*, sn.stream_name FROM ${streamTable} s
             INNER JOIN stream_names sn ON s.stream_id = sn.id
             WHERE s.form = $1 AND s.year = $2
             ORDER BY s.stream_id`,
      values: [sanitizedForm, sanitizedYear],
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
      text: `SELECT s.*, sn.stream_name FROM ${streamTable} s
             INNER JOIN stream_names sn ON s.stream_id = sn.id
             WHERE s.id = $1`,
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

    const { form, stream_id, teacher_id, year } = req.body;
    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({
      form,
      stream_id,
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
    const sanitizedStreamId = sanitizeStringVariables(stream_id).trim();
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
                   WHERE stream_id = $1 AND form = $2 AND id != $3`,
      values: [sanitizedStreamId, sanitizedForm, id],
    });

    if (nameConflict.rows.length > 0) {
      return next(
        createError(
          409,
          "Another stream with this ID already exists for the specified form"
        )
      );
    }

    // Update stream
    const result = await pool.query({
      text: `UPDATE ${streamTable} 
                   SET stream_id = $1, form = $2, teacher_id = $3, year = $4
                   WHERE id = $5 
                   RETURNING *`,
      values: [sanitizedStreamId, sanitizedForm, sanitizedTeacherId, sanitizedYear, id],
    });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err)
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
    const missingFields = validateRequiredFields({ id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize and validate inputs
    const sanitizedForm = sanitizeStringVariables(form);

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

// HIGHER DIMENSIONS

export const addGlobalStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { stream_name} = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({
    stream_name
    });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize inputs
    const sanitizedStreamName = sanitizeStringVariables(stream_name).trim();

    // Check if stream already exists for this year
    const existingStream = await pool.query({
      text: `SELECT 1 FROM stream_names
            WHERE stream_name = $1`,
      values: [sanitizedStreamName],
    });

    if (existingStream.rows.length > 0) {
      return next(createError(409, "A stream record already exists"));
    }

    // Insert new stream
    const result = await pool.query({
      text: `INSERT INTO stream_names 
                   (stream_name)
                   VALUES ($1) 
                   RETURNING *`,
      values: [sanitizedStreamName],
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique violation
      return next(createError(409, "Stream name with these details already exists"));
    }

    next(createError(500, "Failed to create stream", { originalError: err }));
  }
};

// Get All Streams
export const getAllStreamNames = async (req, res, next) => {
  try {
    // Query streams
    const result = await pool.query({
      text: `SELECT * FROM stream_names`,
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No streams names registered"));
    }

    res.status(200).json(result.rows);
  } catch (err) {
    if (err.code === "42P01") {
      // Table does not exist
      return next(
        createError(404, "No stream names table found")
      );
    }

    next(
      createError(500, "Failed to retrieve stream names", { originalError: err })
    );
  }
};

// Get A Single Streams
export const getStreamName = async (req, res, next) => {

  try {

    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { id} = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Query streams
    const result = await pool.query({
      text: `SELECT * FROM stream_names WHERE id = $1`,
      values: [id]
    });

    if (result.rows.length === 0) {
      return next(createError(404, "No streams names registered"));
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      // Table does not exist
      return next(
        createError(404, "No stream names table found")
      );
    }

    next(
      createError(500, "Failed to retrieve stream names", { originalError: err })
    );
  }
};

export const updateGlobalStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { stream_name } = req.body;
    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({
      stream_name,
      id
    });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Sanitize inputs
    const sanitizedStreamName = sanitizeStringVariables(stream_name).trim();


    // Check if stream exists
    const existingStream = await pool.query({
      text: `SELECT 1 FROM stream_names WHERE id = $1`,
      values: [id],
    });

    if (existingStream.rows.length === 0) {
      return next(createError(404, "Stream not found"));
    }

    // Check for name conflict with other streams
    const nameConflict = await pool.query({
      text: `SELECT 1 FROM stream_names 
                   WHERE stream_name = $1`,
      values: [sanitizedStreamName],
    });

    if (nameConflict.rows.length > 0) {
      return next(
        createError(
          409,
          "Another record with the stream name already exists"
        )
      );
    }

    // Update stream
    const result = await pool.query({
      text: `UPDATE stream_names 
                   SET stream_name = $1
                   WHERE id = $2 
                   RETURNING *`,
      values: [
        sanitizedStreamName,
        id,
      ],
    });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "23505") {
      // Unique violation
      return next(createError(409, "Stream with these details already exists"));
    }

    next(createError(500, "Failed to update stream", { originalError: err }));
  }
};

// Delete Stream
export const deleteGlobalStream = async (req, res, next) => {
  try {
    validateContentType(req, res, (err) => {
      if (err) return next(err);
    });

    const { id } = req.params;

    // Validate required fields
    const missingFields = validateRequiredFields({ id });
    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Check if stream exists
    const existingStream = await pool.query({
      text: `SELECT 1 FROM stream_names WHERE id = $1`,
      values: [id],
    });

    if (existingStream.rows.length === 0) {
      return next(createError(404, "Stream not found"));
    }

    // Delete stream
    const result = await pool.query({
      text: `DELETE FROM stream_names 
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
