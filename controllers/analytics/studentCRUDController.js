import xlsx from "xlsx";
import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";
import { createUserAccount } from "./auth/userService.js";

// Constants
const VALID_FORMS = new Set([
  "-1",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "19",
  "20",
  "21",
  "22",
]);

const VALIDATION_PATTERNS = {
  ALPHANUMERIC: /^[a-z0-9_]+$/i,
  NUMERIC: /^[0-9_]+$/,
};

// Utility functions
const validateRequiredFields = (fields, fieldNames) => {
  const missingFields = fieldNames.filter((field) => !fields[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

const sanitizeAndValidate = (value, pattern, fieldName) => {
  const sanitized = sanitizeStringVariables(value);
  if (!pattern.test(sanitized)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return sanitized;
};

const validateFormLevel = (form) => {
  if (!VALID_FORMS.has(form)) {
    // throw new Error(`Invalid form level: ${form}`);
    throw new Error(`Invalid form level`);
  }
};

const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000).toISOString().split("T")[0];
};

// Add Student Controller
export const addStudent = async (req, res, next) => {
  const client = await pool.connect();

  try {
    validateRequiredFields(req.body, [
      "id",
      "fname",
      "lname",
      "sex",
      "dob",
      "stream_id",
      "year",
      "phone",
    ]);

    const {
      id,
      fname,
      mname = null,
      lname,
      sex,
      dob,
      stream_id,
      kcpe_marks = 1,
      form,
      year,
      phone,
      address = null,
    } = req.body;

    // Sanitization and validation
    const sanitizedFName = sanitizeAndValidate(
      fname,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "first name"
    );
    const sanitizedMName = mname ? sanitizeStringVariables(mname) : null;
    const sanitizedLName = sanitizeAndValidate(
      lname,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "last name"
    );
    const sanitizedSex = sanitizeAndValidate(
      sex,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "sex"
    );
    const sanitizedForm = sanitizeAndValidate(
      form,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "form"
    );
    const sanitizedYear = sanitizeAndValidate(
      year,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "year"
    );
    const sanitizedAddress = address ? sanitizeStringVariables(address) : null;

    sanitizeAndValidate(id, VALIDATION_PATTERNS.NUMERIC, "student ID");
    validateFormLevel(sanitizedForm);

    await client.query("BEGIN");

    // Insert student record
    const studentResult = await client.query(
      `INSERT INTO students 
       (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, 
        year_of_enrolment, current_form, current_year, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        id,
        sanitizedFName,
        sanitizedMName,
        sanitizedLName,
        sanitizedSex,
        dob,
        stream_id,
        kcpe_marks || 1,
        sanitizedYear,
        sanitizedForm,
        sanitizedYear,
        phone,
        sanitizedAddress,
      ]
    );

    // Insert selective record
    await client.query(
      `INSERT INTO selectives (student_id, form, stream_id, year) 
       VALUES ($1, $2, $3, $4)`,
      [id, sanitizedForm, stream_id, sanitizedYear]
    );

    // Create User Account linked to this student
    await createUserAccount({
      firstname : sanitizedFName,
      lastname : sanitizedLName,
      phone,
      role : "student",
      user_ref_id : id
    })

    await client.query("COMMIT");
    res.status(201).json(studentResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return next(createError(400, "Student with this ID already exists"));
    }

    next(createError(400, error.message));
  } finally {
    client.release();
  }
};

// Import and add students from excel sheet
export const addStudentsFromExcel = async (req, res, next) => {
  if (!req.file?.buffer) {
    return next(createError(400, "No file uploaded or file is empty"));
  }

  const client = await pool.connect();

  try {
    const workbook = xlsx.read(req.file.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data?.length) {
      return next(createError(400, "No data found in Excel file"));
    }

    const insertedStudents = [];
    const errorRows = [];

    for (const [index, row] of data.entries()) {
      await client.query("BEGIN"); // 🔥 transaction per row

      try {
        let {
          id,
          fname,
          mname = null,
          lname,
          sex,
          dob,
          stream_id,
          kcpe_marks = 1,
          current_form,
          current_year,
          year_of_enrolment,
          status,
          phone,
          address = null,
        } = row;

        // Convert Excel serial date
        if (typeof dob === "number") {
          dob = excelDateToJSDate(dob);
        }

        validateRequiredFields(row, [
          "id",
          "fname",
          "lname",
          "sex",
          "dob",
          "stream_id",
          "current_form",
          "current_year",
          "year_of_enrolment",
          "phone",
        ]);

        // Sanitization (match addStudent)
        sanitizeAndValidate(id, VALIDATION_PATTERNS.NUMERIC, "student ID");

        const sanitizedFName = sanitizeAndValidate(
          fname,
          VALIDATION_PATTERNS.ALPHANUMERIC,
          "first name",
        );

        const sanitizedMName = mname ? sanitizeStringVariables(mname) : null;

        const sanitizedLName = sanitizeAndValidate(
          lname,
          VALIDATION_PATTERNS.ALPHANUMERIC,
          "last name",
        );

        const sanitizedSex = sanitizeAndValidate(
          sex,
          VALIDATION_PATTERNS.ALPHANUMERIC,
          "sex",
        );

        const sanitizedForm = sanitizeAndValidate(
          current_form,
          VALIDATION_PATTERNS.ALPHANUMERIC,
          "current_form",
        );

        const sanitizedYear = sanitizeAndValidate(
          current_year,
          VALIDATION_PATTERNS.ALPHANUMERIC,
          "current_year",
        );

        const sanitizedAddress = address
          ? sanitizeStringVariables(address)
          : null;

        validateFormLevel(sanitizedForm);

        const studentResult = await client.query(
          `INSERT INTO students 
           (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, 
            year_of_enrolment, current_form, current_year, phone, address)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           RETURNING *`,
          [
            id,
            sanitizedFName,
            sanitizedMName,
            sanitizedLName,
            sanitizedSex,
            dob, // 🔥 use raw date like single version
            stream_id,
            kcpe_marks || 1,
            sanitizedYear,
            sanitizedForm,
            sanitizedYear,
            phone,
            sanitizedAddress,
          ],
        );

        await client.query(
          `INSERT INTO selectives (student_id, form, stream_id, year) 
           VALUES ($1,$2,$3,$4)`,
          [id, sanitizedForm, stream_id, sanitizedYear],
        );

        // IMPORTANT: ensure createUserAccount uses same transaction
        await createUserAccount({
          firstname: sanitizedFName,
          lastname: sanitizedLName,
          phone,
          role: "student",
          user_ref_id: id,
          // client, // 🔥 pass client if your function supports it
        });

        await client.query("COMMIT");

        insertedStudents.push(studentResult.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");

        errorRows.push({
          row: index + 2, // Excel row index (header offset)
          error: error.message,
          data: row,
        });
      }
    }

    if (errorRows.length > 0) {
      return res.status(207).json({
        message: `${insertedStudents.length} students added successfully, ${errorRows.length} failed`,
        insertedStudents,
        errorRows,
      });
    }

    res.status(201).json({
      message: `${insertedStudents.length} students added successfully`,
      students: insertedStudents,
    });
  } catch (error) {
    next(createError(500, "Error processing Excel file", error));
  } finally {
    client.release();
  }
};

// Fetch a Single Student Controller
export const getStudent = async (req, res, next) => {
  try {
    const { year, form, student_id } = req.body;

    validateRequiredFields(req.body, ["year", "form", "student_id"]);

    const sanitizedForm = sanitizeAndValidate(
      form,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "form"
    );
    const sanitizedYear = sanitizeStringVariables(year);
    sanitizeAndValidate(student_id, VALIDATION_PATTERNS.NUMERIC, "student ID");

    validateFormLevel(sanitizedForm);

    const result = await pool.query(
      `SELECT * FROM students 
       WHERE id = $1 AND current_form = $2 AND current_year = $3`,
      [student_id, sanitizedForm, sanitizedYear]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "Student not found"));
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(createError(400, error.message));
  }
};

// Fetch Student Info Controller
export const getStudentInfo = async (req, res, next) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return next(createError(400, "Missing student ID"));
    }

    sanitizeAndValidate(student_id, VALIDATION_PATTERNS.NUMERIC, "student ID");

    const result = await pool.query(`SELECT * FROM students WHERE id = $1`, [
      student_id,
    ]);

    if (result.rows.length === 0) {
      return next(createError(404, "Student not found"));
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(createError(400, error.message));
  }
};

// Fetch all Students Controller
export const getAllStudents = async (req, res, next) => {
  try {
    const { form, year } = req.body;

    validateRequiredFields(req.body, ["form", "year"]);

    const sanitizedForm = sanitizeAndValidate(
      form,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "form"
    );
    const sanitizedYear = sanitizeStringVariables(year);

    validateFormLevel(sanitizedForm);

    const result = await pool.query(
      `SELECT * FROM students 
       WHERE current_form = $1 AND current_year = $2`,
      [sanitizedForm, sanitizedYear]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "Students not found"));
    }

    res.status(200).json(result.rows);
  } catch (error) {
    next(createError(400, error.message));
  }
};

// Fetch all Students per Stream Controller
export const getAllStudentsPerStream = async (req, res, next) => {
  try {
    const { form, stream_id, year } = req.body;

    validateRequiredFields(req.body, ["form", "stream_id", "year"]);

    const sanitizedForm = sanitizeAndValidate(
      form,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "form"
    );
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedStreamId = sanitizeAndValidate(
      stream_id,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "stream ID"
    );

    validateFormLevel(sanitizedForm);

    const result = await pool.query(
      `SELECT * FROM students 
       WHERE current_form = $1 AND stream_id = $2 AND current_year = $3`,
      [sanitizedForm, sanitizedStreamId, sanitizedYear]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "Students not found"));
    }

    res.status(200).json(result.rows);
  } catch (error) {
    next(createError(400, error.message));
  }
};

// Fetch all Students across multiple forms
export const getAllFormsStudents = async (req, res, next) => {
  try {
    const { year, forms, term, events_data } = req.body;

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
      !events_data ||
      typeof events_data !== "object" ||
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

    // Validate forms
    const validForms = forms.filter((form) => VALID_FORMS.has(form.toString()));
    if (validForms.length === 0) {
      return next(createError(400, "No valid forms provided"));
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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found in any of the specified forms",
        });
      }

      const data = {
        year,
        term,
        events_data,
        student_data: result.rows,
      };

      return res.status(200).json(data);
    } finally {
      client.release();
    }
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Update a Student Controller
export const updateStudent = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return next(createError(400, "Missing student ID"));
    }

    validateRequiredFields(req.body, [
      "fname",
      "lname",
      "sex",
      "dob",
      "stream_id",
      "year_of_enrolment",
      "phone",
    ]);

    const {
      fname,
      mname = null,
      lname,
      sex,
      dob,
      stream_id,
      kcpe_marks,
      form,
      year_of_enrolment,
      phone,
      address = null,
      upi_number = null,
    } = req.body;

    // Sanitization and validation
    const sanitizedFName = sanitizeAndValidate(
      fname,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "first name"
    );
    const sanitizedMName = mname ? sanitizeStringVariables(mname) : null;
    const sanitizedLName = sanitizeAndValidate(
      lname,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "last name"
    );
    const sanitizedSex = sanitizeAndValidate(
      sex,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "sex"
    );
    const sanitizedDOB = sanitizeAndValidate(
      dob,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "date of birth"
    );
    const sanitizedForm = sanitizeAndValidate(
      form,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "form"
    );
    const sanitizedYear = sanitizeAndValidate(
      year_of_enrolment,
      VALIDATION_PATTERNS.ALPHANUMERIC,
      "year"
    );
    const sanitizedUPI = upi_number
      ? sanitizeStringVariables(upi_number)
      : null;

    sanitizeAndValidate(student_id, VALIDATION_PATTERNS.NUMERIC, "student ID");
    validateFormLevel(sanitizedForm);

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
        sanitizedUPI,
        student_id,
      ]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "Student not found"));
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(createError(400, error.message));
  }
};

// Delete a Student
export const deleteStudent = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return next(createError(400, "Missing student ID"));
    }

    sanitizeAndValidate(student_id, VALIDATION_PATTERNS.NUMERIC, "student ID");

    const result = await pool.query(
      `DELETE FROM students WHERE id = $1 RETURNING *`,
      [student_id]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "Student not found"));
    }

    res.status(204).send();
  } catch (error) {
    next(createError(400, error.message));
  }
};
