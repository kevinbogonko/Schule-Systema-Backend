import pool from "../config/db_connection.js"
import { createError } from "../utils/ErrorHandler.js"
import { sanitizeStringVariables } from "../utils/sanitizeString.js"

// Add Student Controller
export const addStudent = async (req, res, next) =>{

    const { id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, form, year, phone, address } = req.body

    try {
        // Validate input more thoroughly
        if (!id || !fname || !mname|| !lname || !sex || !dob || !stream_id|| !kcpe_marks || !year || !phone) return next(createError(400, 'Missing required parameters!'))
        
        // More strict sanitization
        const sanitizedFName = sanitizeStringVariables(fname)
        const sanitizedMName = sanitizeStringVariables(mname)
        const sanitizedLName = sanitizeStringVariables(lname)
        const sanitizedSex = sanitizeStringVariables(sex)
        const sanitizedDOB = sanitizeStringVariables(dob)
        const sanitizedForm = sanitizeStringVariables(form)
        const sanitizedYear = sanitizeStringVariables(year)

        // Validate inputs against stricter regex pattern
        const validPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validPattern.test(sanitizedFName) || 
            !validPattern.test(sanitizedMName) || 
            !validPattern.test(sanitizedLName) || 
            !validPattern.test(sanitizedSex) || 
            !validPattern.test(sanitizedDOB) || 
            !validPattern.test(stream_id) || 
            !validPattern.test(kcpe_marks) || 
            !validPattern.test(sanitizedForm) || 
            !validPattern.test(sanitizedYear) || 
            !validPattern.test(phone) || 
            !validPattern.test(address))
        return next(createError(400, "Invalid inputs!"))

        const validIdPattern = /^[0-9_]+$/ // Case insensitive, only alphanumeric + underscore
        if (!validIdPattern.test(id)) return next(createError(400, "Invalid Student Reg No!"))
        
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']

        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`
   
        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(
            `INSERT INTO ${studentsTable} (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year, phone, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [id, sanitizedFName, sanitizedMName, sanitizedLName, sanitizedSex, sanitizedDOB, stream_id, kcpe_marks, sanitizedYear, phone, address]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        next(err)
    }
}

// Fetch a Single Student Controller
export const getStudent = async (req, res, next) => {

    const { form, student_id } = req.body
    // const { student_id } = req.params

    try {
        // Validate input more thoroughly
        if (!form || !student_id ) return next(createError(400, 'Missing required parameters!'))
        // More strict sanitization
        const sanitizedForm = sanitizeStringVariables(form)
    
        // Validate inputs against stricter regex pattern
        const validFormPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validFormPattern.test(sanitizedForm)) return next(createError(400, "Invalid Form input!"))


        const validIdPattern = /^[0-9_]+$/ // Case insensitive, only alphanumeric + underscore
        if (!validIdPattern.test(student_id)) return next(createError(400, "Invalid Student Reg No!"))
    
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']

        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`

        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(`SELECT * FROM ${studentsTable} WHERE id = $1`, [student_id])

        if(result.rows.length > 0){
            res.status(200).json(result.rows[0])
        }else{
            next(createError(404, 'Student not Found'))
        }
        
    } catch (err) {
        next(err)
    }
}

// Fetch all Students Controller
export const getAllStudents = async (req, res, next) => {

    const { form } = req.body

    try {
        // Validate input more thoroughly
        if (!form) return next(createError(400, 'Missing required parameters!'))
        // More strict sanitization
        const sanitizedForm = sanitizeStringVariables(form)
    
        // Validate inputs against stricter regex pattern
        const validFormPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validFormPattern.test(sanitizedForm)) return next(createError(400, "Invalid Form input!"))
    
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']

        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`

        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(`SELECT * FROM ${studentsTable}`)

        if(result.rows.length > 0){
            res.status(200).json(result.rows)
        }else{
            next(createError(404, 'Student not Found'))
        }
        
    } catch (err) {
        next(err)
    }
}

// Fetch all Students Controller
export const getAllStudentsPerStream = async (req, res, next) => {

    const { form, stream_id } = req.body

    try {
        // Validate input more thoroughly
        if (!form || !stream_id) return next(createError(400, 'Missing required parameters!'))
        // More strict sanitization
        const sanitizedForm = sanitizeStringVariables(form)
    
        // Validate inputs against stricter regex pattern
        const validFormPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validFormPattern.test(sanitizedForm)) return next(createError(400, "Invalid Form input!"))
    
        const validStreamIdPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validStreamIdPattern.test(stream_id))
          return next(createError(400, "Invalid Stream ID input!"));
    
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']

        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`

        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(`SELECT * FROM ${studentsTable} WHERE stream_id = $1`, [stream_id])

        if(result.rows.length > 0){
            res.status(200).json(result.rows)
        }else{
            next(createError(404, 'Student not Found'))
        }
        
    } catch (err) {
        next(err)
    }
}

// Fetch all Students Controller

// Predefined allowed tables for security
const ALLOWED_TABLES = new Set([
  "students_form_1",
  "students_form_2",
  "students_form_3",
  "students_form_4",
]);

const isValidFormNumber = (form) => /^[1-4]$/.test(form);

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

    const validatedForms = [];
    for (const form of forms) {
      const sanitizedForm = sanitizeStringVariables(form.toString());
      if (!isValidFormNumber(sanitizedForm)) {
        return next(createError(400, `Invalid form number: ${form}`));
      }

      const tableName = `students_form_${sanitizedForm}`;
      if (!ALLOWED_TABLES.has(tableName)) {
        return next(createError(400, `Invalid form: ${form}`));
      }

      validatedForms.push(tableName);
    }

    const uniqueTables = [...new Set(validatedForms)];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const allStudents = [];
      const errors = [];

      for (const table of uniqueTables) {
        try {
          const formNumber = table.split("_").pop();
          const queryText = `
            SELECT *, $1::text AS year, $2::text AS form
            FROM ${table}
            WHERE year = $1
          `;
          const result = await client.query(queryText, [year, formNumber]);

          if (result.rows.length > 0) {
            allStudents.push(...result.rows);
          }
        } catch (err) {
          errors.push(`Error querying ${table}: ${err.message}`);
        }
      }

      await client.query("COMMIT");

      if (allStudents.length > 0) {
        const data = {
            year,
            term,
            events_data,
            student_data: allStudents,
          }
          return data
        // res.status(200).json({
        //   success: true,
        //   count: allStudents.length,
        //   data: {
        //     year,
        //     term,
        //     events_data,
        //     student_data: allStudents,
        //   },
        //   errors: errors.length > 0 ? errors : undefined,
        // });
      } else {
        return res.status(404).json({
          success: false,
          message: "No students found in any of the specified forms",
          errors,
        });
      }
    } catch (err) {
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
    const { fname, mname, lname, sex, dob, stream_id, kcpe_marks, form, year, phone, address } = req.body
    const { student_id } = req.params
    // console.log(fname, mname, lname, sex, dob, stream_id, kcpe_marks, form, year, phone, address, student_id)

    try {
        // Validate input more thoroughly
        if (!student_id || !fname || !mname|| !lname || !sex || !dob || !stream_id|| !kcpe_marks || !year || !phone) return next(createError(400, 'Missing required parameters!'))
        
        // More strict sanitization
        const sanitizedFName = sanitizeStringVariables(fname)
        const sanitizedMName = sanitizeStringVariables(mname)
        const sanitizedLName = sanitizeStringVariables(lname)
        const sanitizedSex = sanitizeStringVariables(sex)
        const sanitizedDOB = sanitizeStringVariables(dob)
        const sanitizedForm = sanitizeStringVariables(form)
        const sanitizedYear = sanitizeStringVariables(year)

        // Validate inputs against stricter regex pattern
        const validPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validPattern.test(sanitizedFName) || 
            !validPattern.test(sanitizedMName) || 
            !validPattern.test(sanitizedLName) || 
            !validPattern.test(sanitizedSex) || 
            !validPattern.test(sanitizedDOB) || 
            !validPattern.test(stream_id) || 
            !validPattern.test(kcpe_marks) || 
            !validPattern.test(sanitizedForm) || 
            !validPattern.test(sanitizedYear) || 
            !validPattern.test(phone) || 
            !validPattern.test(address))
        return next(createError(400, "Invalid inputs!"))

        const validIdPattern = /^[0-9_]+$/ // Case insensitive, only alphanumeric + underscore
        if (!validIdPattern.test(student_id)) return next(createError(400, "Invalid Student Reg No!"))
        
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']

        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`
   
        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(
            `UPDATE ${studentsTable} SET fname = $1, mname = $2, lname = $3, sex = $4, dob = $5,  stream_id = $6, kcpe_marks = $7, year = $8, phone = $9, address = $10 WHERE id = $11 RETURNING *`,
            [sanitizedFName, sanitizedMName, sanitizedLName, sanitizedSex, sanitizedDOB, stream_id, kcpe_marks, sanitizedYear, phone, address, student_id]
        )

        if(result.rows.length > 0){
            res.status(201).json(result.rows)
        }else{
            next(404, 'Student not Found.')
        }

    } catch (err) {
        next(err)
    }
}

// Delete a Student
export const deleteStudent = async (req, res, next) => {

    const {form} = req.body
    const {student_id} = req.params

    try {

        // Validate input more thoroughly
        if(!form) return next(createError(400, 'Missing form required parameters!'))
        if(!student_id) return next(createError(400, 'Missing student required parameters!'))

        if (!form || !student_id ) return next(createError(400, 'Missing required parameters!'))

        // More strict sanitization
        const sanitizedForm = sanitizeStringVariables(form)
        
        // Validate inputs against stricter regex pattern
        const validFormPattern = /^[a-z0-9_]+$/i // Case insensitive, only alphanumeric + underscore
        if (!validFormPattern.test(sanitizedForm)) return next(createError(400, "Invalid Form input!"))
    
        const validIdPattern = /^[0-9_]+$/ // Case insensitive, only alphanumeric + underscore
        if (!validIdPattern.test(student_id)) return next(createError(400, "Invalid Student Reg No!"))
        
        // Restrict table names to a predefined list
        const allowedTables = ['students_form_1', 'students_form_2', 'students_form_3', 'students_form_4']
    
        // Students Table
        const studentsTable = `students_form_${sanitizedForm}`
    
        // Ensure the sanitized table name exists in allowed table list
        if(!allowedTables.includes(studentsTable)) return next(createError(400, 'Invalid form!'))

        const result = await pool.query(
            `DELETE FROM ${studentsTable} WHERE id = $1 RETURNING *`,
            [student_id]
        )

        if(result.rows.length > 0){
            res.status(204).send()
        }else{
            next(createError(404, 'Student not Found.'))
        }

    } catch (err) {
        next(err)
    }
}