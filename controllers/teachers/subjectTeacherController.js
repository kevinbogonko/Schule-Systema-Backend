import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Get all SubjectTeachers
export const getSubjectTeachers = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  const { form, stream_id, year } = req.body;

  try {
    // 1. Validate required fields
    const requiredFields = { form, year, stream_id };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(createError(400, `Missing: ${missingFields.join(", ")}`));
    }

    // 2. Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedStreamId = sanitizeStringVariables(stream_id);

    const subjectsTable = `subjects_form_${sanitizedForm}`;
    const subjectTeachersTable = `subjectteachers_form_${sanitizedForm}`;

    // 3. Fetch subjects with status = 1
    const subjectResult = await pool.query(
      `SELECT id, name FROM ${subjectsTable} WHERE status = 1`
    );
    const activeSubjects = subjectResult.rows.map((s) => ({
      id: parseInt(s.id),
      name: s.name,
    }));
    const activeSubjectIds = activeSubjects.map((s) => s.id);

    // 4. Fetch assigned subjects for stream + year
    const teacherResult = await pool.query(
      `SELECT id, stream_id, teacher_id, subject_id, year, unival 
       FROM ${subjectTeachersTable} 
       WHERE stream_id = $1 AND year = $2`,
      [sanitizedStreamId, sanitizedYear]
    );
    const teacherRows = teacherResult.rows;

    const assignedSubjectIdsRaw = teacherRows.map((r) => parseInt(r.subject_id));
    const assignedSubjectIds = assignedSubjectIdsRaw.filter((id) =>
      activeSubjectIds.includes(id)
    );

    // 5. Identify unassigned subject ids
    const unassignedSubjectIds = activeSubjectIds.filter(
      (id) => !assignedSubjectIds.includes(id)
    );

    // 6. Build assignedSubjects with instructor info
    let assignedSubjects = [];

    if (assignedSubjectIds.length > 0) {
      const placeholders = assignedSubjectIds.map((_, i) => `$${i + 3}`).join(","); // $3, $4, $5...
      const detailedAssigned = await pool.query(
        `SELECT st.id, st.subject_id, st.teacher_id, s.name AS subject_name, sf.title, sf.fname, sf.lname
         FROM ${subjectTeachersTable} st
         JOIN ${subjectsTable} s ON st.subject_id = s.id
         JOIN staff sf ON st.teacher_id = sf.id
         WHERE st.stream_id = $1 AND st.year = $2 AND st.subject_id IN (${placeholders})`,
        [sanitizedStreamId, sanitizedYear, ...assignedSubjectIds]
      );

      assignedSubjects = detailedAssigned.rows.map((row) => ({
        id: row.id,
        code: parseInt(row.subject_id),
        name: row.subject_name,
        instructor: `${row.title} ${row.fname} ${row.lname}`,
      }));
    }

    // 7. Build unassignedSubjects
    const unassignedSubjects = activeSubjects
      .filter((s) => unassignedSubjectIds.includes(s.id))
      .map((s) => ({
        value: s.id,
        label: s.name,
      }));

    // 8. Return final response
    return res.status(200).json({
      assignedSubjects,
      unassignedSubjects,
    });

  } catch (err) {
    return next(createError(500, "An error occurred while processing your request."));
  }
};

// Get all SubjectTeachers
export const getSubjectTeachersWithoutConstraints = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  const { form, year } = req.body;

  try {
    // 1. Validate required fields
    const requiredFields = { form, year };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(createError(400, `Missing: ${missingFields.join(", ")}`));
    }

    // 2. Sanitize inputs
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    const subjectsTable = `subjects_form_${sanitizedForm}`;
    const subjectTeachersTable = `subjectteachers_form_${sanitizedForm}`;

    // 3. Fetch subjects with status = 1
    const subjectResult = await pool.query(
      `SELECT id, name, init FROM ${subjectsTable} WHERE status = 1`
    );
    // subjectResult.rows.map((row) => console.log(row));
    const activeSubjects = subjectResult.rows.map((s) => ({
      id: parseInt(s.id),
      name: s.name,
      init : s.init
    }));
    const activeSubjectIds = activeSubjects.map((s) => s.id);

    // 4. Fetch assigned subjects for stream + year
    const teacherResult = await pool.query(
      `SELECT id, stream_id, teacher_id, subject_id, year, unival 
       FROM ${subjectTeachersTable} 
       WHERE year = $1`,
      [sanitizedYear]
    );
    const teacherRows = teacherResult.rows;

    const assignedSubjectIdsRaw = teacherRows.map((r) => parseInt(r.subject_id));
    const assignedSubjectIds = assignedSubjectIdsRaw.filter((id) =>
      activeSubjectIds.includes(id)
    );

    // // 5. Identify unassigned subject ids
    // const unassignedSubjectIds = activeSubjectIds.filter(
    //   (id) => !assignedSubjectIds.includes(id)
    // );

    // 6. Build assignedSubjects with instructor info
    let assignedSubjects = [];

    if (assignedSubjectIds.length > 0) {
      const placeholders = assignedSubjectIds.map((_, i) => `$${i + 2}`).join(","); // $2, $3, $4, $5...
      const detailedAssigned = await pool.query(
        `SELECT st.id, st.stream_id, st.subject_id, st.teacher_id, s.name AS subject_name, sf.title, sf.fname, sf.lname
         FROM ${subjectTeachersTable} st
         JOIN ${subjectsTable} s ON st.subject_id = s.id
         JOIN staff sf ON st.teacher_id = sf.id
         WHERE st.year = $1 AND st.subject_id IN (${placeholders})`,
        [sanitizedYear, ...assignedSubjectIds]
      );

      // detailedAssigned.rows.map((row) => console.log(row))

      assignedSubjects = detailedAssigned.rows.map((row) => ({
        id: row.id,
        teacher_id: row.teacher_id,
        stream_id: row.stream_id,
        code: parseInt(row.subject_id),
        init: activeSubjects.find((s) => s.name === row.subject_name).init,
        name: row.subject_name,
        instructor: `${row.title} ${row.lname}`,
      }));
    }

    // 7. Return final response
    return res.status(200).json(assignedSubjects);

  } catch (err) {
    console.log(err)
    return next(createError(500, "An error occurred while processing your request."));
  }
};

// Add SubjectTeacher
export const addSubjectTeacher = async (req, res, next) => {
  // Validate Content-Type
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  const { stream_id, teacher_id, subject_id, year, form } = req.body;

  try {
    // 1. Validate required fields
    const requiredFields = { form, stream_id, teacher_id, subject_id, year };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(createError(400, `Missing required fields: ${missingFields.join(", ")}`));
    }

    // 2. Sanitize and validate inputs
    const sanitizedYear = sanitizeStringVariables(year.toString());
    const sanitizedForm = sanitizeStringVariables(form.toString());

    // Validate numeric IDs are positive integers
    const validateId = (id, name) => {
      const num = Number(id);
      if (!Number.isInteger(num) || num <= 0) {
        throw createError(400, `Invalid ${name}: must be a positive integer`);
      }
      return num;
    };

    const validatedStreamId = validateId(stream_id, "stream_id");
    const validatedTeacherId = validateId(teacher_id, "teacher_id");
    const validatedSubjectId = validateId(subject_id, "subject_id");

    // Validate year format (assuming YYYY format)
    if (!/^\d{4}$/.test(sanitizedYear)) {
      return next(createError(400, "Invalid year format. Expected YYYY"));
    }

    // Validate form format (assuming single digit/character)
    if (!/^[1-6A-Za-z]$/.test(sanitizedForm)) {
      return next(createError(400, "Invalid form format"));
    }

    // 3. Check if table exists
    const subjectTeachersTable = `subjectteachers_form_${sanitizedForm}`;
    
    try {
      await pool.query(`SELECT 1 FROM ${subjectTeachersTable} LIMIT 1`);
    } catch (err) {
      return next(createError(404, `Table not found for form ${sanitizedForm}`));
    }

    // 4. Check for existing assignment
    const checkExisting = await pool.query(
      `SELECT 1 FROM ${subjectTeachersTable} 
       WHERE stream_id = $1 AND subject_id = $2 AND year = $3`,
      [validatedStreamId, validatedSubjectId, sanitizedYear]
    );

    if (checkExisting.rows.length > 0) {
      return next(createError(409, "Teacher already assigned to this subject for the given stream and year"));
    }

    // 5. Create unique value
    const uniVal = `${validatedStreamId}_${validatedSubjectId}_${sanitizedYear}`;

    // 6. Insert record
    const result = await pool.query(
      `INSERT INTO ${subjectTeachersTable} 
       (stream_id, teacher_id, subject_id, year, unival)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [validatedStreamId, validatedTeacherId, validatedSubjectId, sanitizedYear, uniVal]
    );

    // 7. Verify insertion
    if (result.rows.length === 0) {
      throw createError(500, "Failed to create subject teacher assignment");
    }

    // 8. Success response
    res.status(201).json(result.rows[0]);

  } catch (err) {
    // Handle specific database errors
    if (err.code === '23503') { // Foreign key violation
      return next(createError(404, "Referenced teacher, subject, or stream not found"));
    }
    if (err.code === '23505') { // Unique violation
      return next(createError(409, "This assignment already exists"));
    }
    
    // Pass other errors to error handling middleware
    next(err);
  }
};

// Fetch a Single Subject Teacher Controller
export const getSubjectTeacher = async (req, res, next) => {
  const { form, id } = req.body;

  try {
    // Validate input presence
    if (!id || !form) {
      return next(createError(400, 'Missing required parameters: form and id'));
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
    const subjectTeachersTable = `subjectteachers_form_${sanitizedForm}`;

    // Validate table name pattern to prevent SQL injection
    const validTablePattern = /^subjectteachers_form_[a-z0-9_]{1,50}$/i;
    if (!validTablePattern.test(subjectTeachersTable)) {
      return next(createError(400, "Invalid table name format"));
    }

    // Query the database with parameterized query
    const queryText = `SELECT teacher_id FROM ${subjectTeachersTable} WHERE id = $1`;
    const result = await pool.query(queryText, [sanitizedId]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      next(createError(404, 'Subject teacher not found'));
    }
  } catch (err) {
    // Log the error for debugging
    // console.error('Error in getSubjectTeacher:', err);
    
    // Handle specific database errors
    if (err.code === '42P01') { // Table does not exist
      return next(createError(404, 'Requested data not found'));
    }
    
    next(createError(500, 'Internal server error'));
  }
};

// Update a Subject Teacher Controller
export const updateSubjectTeacher = async (req, res, next) => {
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
      return next(createError(400, "Invalid Form input! Only alphanumeric characters and underscores are allowed (max 50 chars)"));
    }

    // Construct and validate table name
    const subjectTeachersTable = `subjectteachers_form_${sanitizedForm}`;
    const validTablePattern = /^subjectteachers_form_[a-z0-9_]{1,50}$/i;
    if (!validTablePattern.test(subjectTeachersTable)) {
      return next(createError(400, "Invalid table name format"));
    }

    // Execute parameterized query
    const queryText = `
      UPDATE ${subjectTeachersTable} 
      SET teacher_id = $1 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await pool.query(queryText, [sanitizedTeacherId, sanitizedId]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      return next(createError(404, 'Subject Teacher not found. No records were updated.'));
    }

  } catch (err) {
    // Handle specific database errors
    if (err.code === '42P01') { // Table does not exist
      return next(createError(404, 'Requested Subject Teacher form does not exist'));
    }
    if (err.code === '23503') { // Foreign key violation
      return next(createError(400, 'The specified teacher does not exist'));
    }
    if (err.code === '23505') { // Unique constraint violation
      return next(createError(409, 'This teacher assignment already exists'));
    }

    // Log unexpected errors
    next(createError(500, 'Failed to update Subject Teacher record due to server error'));
  }
};