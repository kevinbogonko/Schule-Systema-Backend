import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";

// Email validation regex
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// Add Teacher
export const addStaff = async (req, res, next) => {
    if (!req.is('application/json')) {
      return next(createError(415, 'Expected application/json'));
    }
  
    const { id, title, fname, mname, lname, sex, year, phone, email } = req.body;
  
    try {
      // Validate required fields
      const requiredFields = { id, title, fname, lname, sex, year, phone, email };
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
  
      if (missingFields.length > 0) {
        return next(createError(400, `Missing: ${missingFields.join(', ')}`));
      }
  
      // Basic ID validation
      if (!/^\d+$/.test(id.toString())) {
        return next(createError(400, "Staff ID must be numeric"));
      }
  
      // Title validation (allows common titles with periods)
      if (!/^[a-zA-Z .]+$/.test(title)) {
        return next(createError(400, "Invalid title format"));
      }
  
      // Name validation (allows letters, hyphens, and spaces)
      const nameFields = { first_name: fname, last_name: lname };
      if (mname) nameFields.middle_name = mname;
  
      for (const [field, value] of Object.entries(nameFields)) {
        if (!/^[a-zA-Z\- ]+$/.test(value)) {
          return next(createError(400, `Invalid ${field.replace('_', ' ')} format`));
        }
      }
  
      // Email validation
      const cleanEmail = email.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        return next(createError(400, "Invalid email format"));
      }
  
      // Check for duplicate email
      const emailCheck = await pool.query(
        `SELECT id FROM staff WHERE email = $1`, 
        [cleanEmail]
      );
      if (emailCheck.rows.length > 0) {
        return next(createError(409, "Email already exists"));
      }
  
      // Insert record
      const result = await pool.query(
        `INSERT INTO staff 
         (id, title, fname, mname, lname, sex, year, phone, email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [id, title.trim(), fname.trim(), mname?.trim(), lname.trim(), 
         sex, year, phone.toString().trim(), cleanEmail]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(createError(500, "Failed to add staff", err));
    }
};

// Fetch all Teachers
export const getAllStaff = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { year } = req.body;

    try {
        if (!year) {
            return next(createError(400, 'Year parameter is required'));
        }

        const sanitizedYear = year.toString().trim();
        if (!/^\d{4}$/.test(sanitizedYear)) {
            return next(createError(400, "Invalid year format"));
        }

        const result = await pool.query(
            `SELECT * FROM staff WHERE year = $1`, 
            [sanitizedYear]
        );

        if (result.rows.length === 0) {
            return next(createError(404, 'No staff found for the specified year'));
        }

        res.status(200).json(result.rows);
    } catch (err) {
        next(createError(500, "Failed to fetch staff", err));
    }
};

// Fetch single Teacher
export const getStaff = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { teacher_id } = req.body;

    try {
        if (!teacher_id) {
            return next(createError(400, 'Teacher ID is required'));
        }

        if (!/^\d+$/.test(teacher_id.toString().trim())) {
            return next(createError(400, "Invalid Teacher ID format"));
        }

        const result = await pool.query(
            `SELECT * FROM staff WHERE id = $1`, 
            [teacher_id]
        );

        if (result.rows.length === 0) {
            return next(createError(404, 'Teacher not found'));
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        next(createError(500, "Failed to fetch teacher", err));
    }
};

// Update Teacher
export const updateStaff = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { title, fname, mname, lname, sex, year, phone, email } = req.body;
    const { teacher_id } = req.params;

    try {
        // Validate required fields
        const requiredFields = { teacher_id, title, fname, lname, sex, year, phone, email };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return next(createError(400, `Missing required fields: ${missingFields.join(', ')}`));
        }

        // Validate ID format
        if (!/^\d+$/.test(teacher_id.toString().trim())) {
            return next(createError(400, "Invalid Teacher ID format"));
        }

        // Validate email format
        const cleanEmail = email.trim().toLowerCase();
        if (!isValidEmail(cleanEmail)) {
          return next(createError(400, "Invalid email format"));
        }

        // Check if email exists for other staff members
        const emailCheck = await pool.query(
            `SELECT id FROM staff WHERE email = $1`,
            [cleanEmail]
        )
  
        if (emailCheck.rows.length > 0){
            const existingStaffId = emailCheck.rows[0].id
            if (parseInt(existingStaffId) !== parseInt(teacher_id)) return next(createError(409, 'Email already in use by another staff member'))
        }
        // Title validation (allows common titles with periods)
        if (!/^[a-zA-Z .]+$/.test(title)) {
            return next(createError(400, "Invalid title format"));
        }

        // Update record
        const result = await pool.query(
            `UPDATE staff SET 
                title = $1, 
                fname = $2, 
                mname = $3, 
                lname = $4, 
                sex = $5, 
                year = $6, 
                phone = $7, 
                email = $8 
             WHERE id = $9 RETURNING *`,
            [title, fname, mname || null, lname, sex, year, phone, cleanEmail, teacher_id]
        );

        if (result.rows.length === 0) {
            return next(createError(404, 'Teacher not found'));
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        next(createError(500, "Failed to update teacher", err));
    }
};

// Delete Teacher
export const deleteStaff = async (req, res, next) => {
    const { teacher_id } = req.params;

    try {
        if (!teacher_id) {
            return next(createError(400, 'Teacher ID is required'));
        }

        if (!/^\d+$/.test(teacher_id.toString().trim())) {
            return next(createError(400, "Invalid Teacher ID format"));
        }

        const result = await pool.query(
            `DELETE FROM staff WHERE id = $1 RETURNING *`,
            [teacher_id]
        );

        if (result.rows.length === 0) {
            return next(createError(404, 'Teacher not found'));
        }

        res.status(204).send();
    } catch (err) {
        next(createError(500, "Failed to delete teacher", err));
    }
};

