import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";


// Fetch all Class Teachers Controller
export const getAllClassTeachers = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, year } = req.body;
  
    try {
      // Validate input presence
      if (!year || !form) {
        return next(createError(400, 'Missing required parameters: form and year'));
      }
  
      // Sanitize inputs
      const sanitizedForm = sanitizeStringVariables(form);
      const sanitizedYear = sanitizeStringVariables(year);
  
      // Validate form input against strict pattern
      const validFormPattern = /^[a-z0-9_]{1,50}$/i; // Case insensitive, alphanumeric + underscore, length limit
      if (!validFormPattern.test(sanitizedForm)) {
        return next(createError(400, "Invalid Form input!"));
      }
  
      // Validate ID input against strict pattern
      const validYearPattern = /^[0-9]{1,4}$/; // Only numbers, length limit
      if (!validYearPattern.test(sanitizedYear)) {
        return next(createError(400, "Invalid Year Value!"));
      }
  
      // Construct table name safely
      const streamsTable = `form_${sanitizedForm}_streams`;
  
      // Validate table name pattern to prevent SQL injection
      const validTablePattern = /^form_[a-z0-9_]_streams{1,50}$/i;
      if (!validTablePattern.test(streamsTable)) {
        return next(createError(400, "Invalid table name format"));
      }
  
      // Query the database with parameterized query
      const queryText = `SELECT * FROM ${streamsTable} WHERE year = $1`;
      const result = await pool.query(queryText, [sanitizedYear]);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        next(createError(404, 'No record found. Please Add.')); //Class teachers
      }
    } catch (err) {
      
      // Handle specific database errors
      if (err.code === '42P01') { // Table does not exist
        return next(createError(404, 'Requested data not found'));
      }
      
      next(createError(500, 'Internal server error'));
    }
};

// Fetch a Single Class Teacher Controller
export const getClassTeacher = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, id } = req.body;
  
    try {
      // Validate input presence
      if (!id || !form) {
        return next(createError(400, 'Missing required parameters: form and stream id'));
      }
  
      // Sanitize inputs
      const sanitizedForm = sanitizeStringVariables(form);
      const sanitizedId = sanitizeStringVariables(id);
  
      // Validate form input against strict pattern
      const validFormPattern = /^[a-z0-9_]{1,50}$/i; // Case insensitive, alphanumeric + underscore, length limit
      if (!validFormPattern.test(sanitizedForm)) {
        return next(createError(400, "Invalid Form input! Only alphanumeric characters and underscores are allowed (max 50 chars)"));
      }
  
      // Validate ID input against strict pattern
      const validIdPattern = /^[0-9]{1,20}$/; // Only numbers, length limit
      if (!validIdPattern.test(sanitizedId)) {
        return next(createError(400, "Invalid Record ID! Only numeric values are allowed (max 20 digits)"));
      }
  
      // Construct table name safely
      const streamsTable = `form_${sanitizedForm}_streams`;
  
      // Validate table name pattern to prevent SQL injection
      const validTablePattern = /^form_[a-z0-9_]_streams{1,50}$/i;
      if (!validTablePattern.test(streamsTable)) {
        return next(createError(400, "Invalid table name format"));
      }
  
      // Query the database with parameterized query
      const queryText = `SELECT teacher_id FROM ${streamsTable} WHERE id = $1`;
      const result = await pool.query(queryText, [sanitizedId]);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        next(createError(404, 'Class teacher not found'));
      }
    } catch (err) {
      
      // Handle specific database errors
      if (err.code === '42P01') { // Table does not exist
        return next(createError(404, 'Requested data not found'));
      }
      
      next(createError(500, 'Internal server error'));
    }
};

// Update a Class Teacher Controller
export const updateClassTeacher = async (req, res, next) => {

    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, teacher_id } = req.body;
    const { id } = req.params;
  
    try {
      // Validate parameter presence
      if (!id || !form || !teacher_id) {
        return next(createError(400, 'Missing required parameters: id, form, or teacher_id'));
      }
  
      // Sanitize all inputs
      const sanitizedId = sanitizeStringVariables(id);
      const sanitizedForm = sanitizeStringVariables(form);
      const sanitizedTeacherId = sanitizeStringVariables(teacher_id);
  
      // Validate ID pattern (only numbers, length 1-20)
      const validIdPattern = /^[0-9]{1,20}$/;
      if (!validIdPattern.test(sanitizedId)) {
        return next(createError(400, "Invalid Record ID! Only numeric values are allowed (max 20 digits)"));
      }
  
      // Validate Teacher ID pattern (only numbers, length 1-20)
      if (!validIdPattern.test(sanitizedTeacherId)) {
        return next(createError(400, "Invalid Teacher ID! Only numeric values are allowed (max 20 digits)"));
      }
  
      // Validate form input (alphanumeric + underscore, length 1-50)
      const validFormPattern = /^[a-z0-9_]{1,50}$/i;
      if (!validFormPattern.test(sanitizedForm)) {
        return next(createError(400, "Invalid Form input! Only numeric values are allowed (1 - 4)"));
      }
  
      // Construct and validate table name
      const streamsTable = `form_${sanitizedForm}_streams`;
      const validTablePattern = /^form_[a-z0-9_]_streams{1,50}$/i;
      if (!validTablePattern.test(streamsTable)) {
        return next(createError(400, "Invalid table name format"));
      }
  
      // Execute parameterized query
      const queryText = `
        UPDATE ${streamsTable} 
        SET teacher_id = $1 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(queryText, [sanitizedTeacherId, sanitizedId]);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        return next(createError(404, 'Class Teacher not found. No records were updated.'));
      }
  
    } catch (err) {
      // Handle specific database errors
      if (err.code === '42P01') { // Table does not exist
        return next(createError(404, 'Requested Class Teacher form does not exist'));
      }
      if (err.code === '23503') { // Foreign key violation
        return next(createError(400, 'The specified teacher does not exist'));
      }
      if (err.code === '23505') { // Unique constraint violation
        return next(createError(409, 'This teacher assignment already exists'));
      }
  
      // Log unexpected errors
      next(createError(500, 'Failed to update Class Teacher record due to server error'));
    }
};