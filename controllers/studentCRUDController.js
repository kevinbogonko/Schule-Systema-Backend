import pool from "../config/db_connection.js";
import { createError } from "../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../utils/sanitizeString.js";

// Add Student Controller
export const addStudent = async (req, res, next) => {
  const {
    id,
    fname,
    mname,
    lname,
    sex,
    dob,
    stream_id,
    kcpe_marks,
    form,
    // year,
    phone,
    address,
  } = req.body;

  try {
    // Validate input more thoroughly
    if (
      !id ||
      !fname ||
      !mname ||
      !lname ||
      !sex ||
      !dob ||
      !stream_id ||
      !kcpe_marks ||
      // !year ||
      !phone
    )
      return next(createError(400, "Missing required parameters!"));
      const year = 2025

    // More strict sanitization
    const sanitizedFName = sanitizeStringVariables(fname);
    const sanitizedMName = sanitizeStringVariables(mname);
    const sanitizedLName = sanitizeStringVariables(lname);
    const sanitizedSex = sanitizeStringVariables(sex);
    const sanitizedDOB = sanitizeStringVariables(dob);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    // Validate inputs against stricter regex pattern
    const validPattern = /^[a-z0-9_]+$/i;
    if (
      !validPattern.test(sanitizedFName) ||
      !validPattern.test(sanitizedMName) ||
      !validPattern.test(sanitizedLName) ||
      !validPattern.test(sanitizedSex) ||
      !validPattern.test(sanitizedDOB) ||
      !validPattern.test(stream_id) ||
      !validPattern.test(kcpe_marks) ||
      !validPattern.test(sanitizedForm) ||
      !validPattern.test(sanitizedYear) ||
      !validPattern.test(phone) ||
      !validPattern.test(address)
    )
      return next(createError(400, "Invalid inputs!"));

    const validIdPattern = /^[0-9_]+$/;
    if (!validIdPattern.test(id))
      return next(createError(400, "Invalid Student Reg No!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `INSERT INTO students 
             (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year_of_enrolment, current_form, current_year, phone, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
             RETURNING *`,
      [
        id,
        sanitizedFName,
        sanitizedMName,
        sanitizedLName,
        sanitizedSex,
        sanitizedDOB,
        stream_id,
        kcpe_marks,
        sanitizedYear,
        sanitizedForm,
        sanitizedYear,
        phone,
        address,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Fetch a Single Student Controller
export const getStudent = async (req, res, next) => {
  const { year, form, student_id } = req.body;

  try {
    if (!year || !form || !student_id)
      return next(createError(400, "Missing required parameters!"));

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    const validFormPattern = /^[a-z0-9_]+$/i;
    if (!validFormPattern.test(sanitizedForm))
      return next(createError(400, "Invalid Form input!"));

    const validIdPattern = /^[0-9_]+$/;
    if (!validIdPattern.test(student_id))
      return next(createError(400, "Invalid Student Reg No!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `SELECT * FROM students 
             WHERE id = $1 AND current_form = $2 AND current_year = $3`,
      [student_id, sanitizedForm, sanitizedYear]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      next(createError(404, "Student not Found"));
    }
  } catch (err) {
    next(err);
  }
};

// Fetch a Single Student Controller
export const getStudentInfo = async (req, res, next) => {
  const { student_id } = req.body;

  try {
    if (!student_id)
      return next(createError(400, "Missing required parameters!"));

    const validIdPattern = /^[0-9_]+$/;
    if (!validIdPattern.test(student_id))
      return next(createError(400, "Invalid Student Reg No!"));

    const result = await pool.query(
      `SELECT * FROM students 
             WHERE id = $1`,
      [student_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      next(createError(404, "Student not Found"));
    }
  } catch (err) {
    next(err);
  }
};

// Fetch all Students Controller
export const getAllStudents = async (req, res, next) => {
  const { form, year } = req.body;

  try {
    if (!form || !year)
      return next(createError(400, "Missing required parameters!"));

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    const validFormPattern = /^[a-z0-9_]+$/i;
    if (!validFormPattern.test(sanitizedForm))
      return next(createError(400, "Invalid Form input!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `SELECT * FROM students 
             WHERE current_form = $1 AND current_year = $2`,
      [sanitizedForm, sanitizedYear]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      next(createError(404, "Students not Found"));
    }
  } catch (err) {
    next(err);
  }
};

// Fetch all Students per Stream Controller
export const getAllStudentsPerStream = async (req, res, next) => {
  const { form, stream_id, year } = req.body;

  try {
    if (!form || !stream_id || !year)
      return next(createError(400, "Missing required parameters!"));

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year);

    const validFormPattern = /^[a-z0-9_]+$/i;
    if (!validFormPattern.test(sanitizedForm))
      return next(createError(400, "Invalid Form input!"));

    const validStreamIdPattern = /^[a-z0-9_]+$/i;
    if (!validStreamIdPattern.test(stream_id))
      return next(createError(400, "Invalid Stream ID input!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `SELECT * FROM students 
             WHERE current_form = $1 AND stream_id = $2 AND current_year = $3`,
      [sanitizedForm, stream_id, sanitizedYear]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      next(createError(404, "Students not Found"));
    }
  } catch (err) {
    next(err);
  }
};

// Fetch all Students across multiple forms
export const getAllFormsStudents = async (req, res, next) => {
  const { year, forms, term, events_data } = req.body;

  try {
    if (!year || !forms) {
      return next(
        createError(400, "Missing required parameters: year and forms")
      );
    }

    if (!Array.isArray(forms) || forms.length === 0) {
      return next(createError(400, "Forms must be a non-empty array"));
    }

    if (typeof term !== "string" || term.trim() === "") {
      return next(createError(400, "Invalid or missing term"));
    }

    if (
      typeof events_data !== "object" ||
      events_data === null ||
      Array.isArray(events_data)
    ) {
      return next(createError(400, "events_data must be a valid object"));
    }

    // Validate event values
    for (const [key, value] of Object.entries(events_data)) {
      if (key !== "details" && value == null) {
        return next(createError(400, `events_data.${key} must not be null`));
      }
    }

    // Validate forms are between 1-4
    const validForms = forms.filter((form) =>
      ["1", "2", "3", "4"].includes(form.toString())
    );
    if (validForms.length === 0) {
      return next(createError(400, "No valid forms provided (must be 1-4)"));
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `SELECT *, $1::integer AS year, current_form AS form
                 FROM students 
                 WHERE current_year = $1 AND current_form = ANY($2)`,
        [year, validForms]
      );

      await client.query("COMMIT");

      if (result.rows.length > 0) {
        const data = {
          year,
          term,
          events_data,
          student_data: result.rows,
        };
        return data;
      } else {
        return res.status(404).json({
          success: false,
          message: "No students found in any of the specified forms",
        });
      }
    } catch (err) {
      console.log(err)
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

// Update a Student Controller
export const updateStudent = async (req, res, next) => {
  const {
    fname,
    mname,
    lname,
    sex,
    dob,
    stream_id,
    kcpe_marks,
    form,
    year_of_enrolment,
    phone,
    address,
    upi_number,
  } = req.body;
  
  const { student_id } = req.params;

  try {
    if (
      !student_id ||
      !fname ||
      !mname ||
      !lname ||
      !sex ||
      !dob ||
      !stream_id ||
      !kcpe_marks ||
      !year_of_enrolment ||
      !phone
    )
      return next(createError(400, "Missing required parameters!"));

    const sanitizedFName = sanitizeStringVariables(fname);
    const sanitizedMName = sanitizeStringVariables(mname);
    const sanitizedLName = sanitizeStringVariables(lname);
    const sanitizedSex = sanitizeStringVariables(sex);
    const sanitizedDOB = sanitizeStringVariables(dob);
    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedYear = sanitizeStringVariables(year_of_enrolment);
    const sanitizedUPI = sanitizeStringVariables(upi_number);

    const validPattern = /^[a-z0-9_]+$/i;
    if (
      !validPattern.test(sanitizedFName) ||
      !validPattern.test(sanitizedMName) ||
      !validPattern.test(sanitizedLName) ||
      !validPattern.test(sanitizedSex) ||
      !validPattern.test(sanitizedDOB) ||
      !validPattern.test(stream_id) ||
      !validPattern.test(kcpe_marks) ||
      !validPattern.test(sanitizedForm) ||
      !validPattern.test(sanitizedYear) ||
      !validPattern.test(sanitizedUPI) ||
      !validPattern.test(phone) ||
      !validPattern.test(address)
    )
      return next(createError(400, "Invalid inputs!"));

    const validIdPattern = /^[0-9_]+$/;
    if (!validIdPattern.test(student_id))
      return next(createError(400, "Invalid Student Reg No!"));

    // Validate form is between 1-4
    if (!["1", "2", "3", "4"].includes(sanitizedForm))
      return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `UPDATE students SET 
                fname = $1, mname = $2, lname = $3, sex = $4, dob = $5, 
                stream_id = $6, kcpe_marks = $7, current_form = $8, year_of_enrolment = $9, 
                phone = $10, address = $11, upi_number = $12 
             WHERE id = $13 
             RETURNING *`,
      [
        sanitizedFName,
        sanitizedMName,
        sanitizedLName,
        sanitizedSex,
        sanitizedDOB,
        stream_id,
        kcpe_marks,
        sanitizedForm,
        sanitizedYear,
        phone,
        address,
        upi_number,
        student_id,
      ]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      next(createError(404, "Student not Found."));
    }
  } catch (err) {
    console.log(err)
    next(err);
  }
};

// Delete a Student
export const deleteStudent = async (req, res, next) => {
  const { form, year } = req.body;
  const { student_id } = req.params;

  try {
    if (!student_id)
      return next(createError(400, "Missing required parameters!"));

    // const sanitizedForm = sanitizeStringVariables(form);
    // const sanitizedYear = sanitizeStringVariables(year);

    // const validFormPattern = /^[a-z0-9_]+$/i;
    // if (!validFormPattern.test(sanitizedForm))
    //   return next(createError(400, "Invalid Form input!"));

    const validIdPattern = /^[0-9_]+$/;
    if (!validIdPattern.test(student_id))
      return next(createError(400, "Invalid Student Reg No!"));

    // Validate form is between 1-4
    // if (!["1", "2", "3", "4"].includes(sanitizedForm))
    //   return next(createError(400, "Invalid form! Must be 1-4"));

    const result = await pool.query(
      `DELETE FROM students 
             WHERE id = $1
             RETURNING *`,
      [student_id]
    );

    if (result.rows.length > 0) {
      res.status(204).send();
    } else {
      next(createError(404, "Student not Found."));
    }
  } catch (err) {
    next(err);
  }
};
