import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Fetching grading scale for a specific subject
export const gradingScale = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, exam, subject } = req.body;

    let client;

    try {
        if (!form || !exam || !subject) {
            return next(createError(400, 'Missing required parameters!'));
        }

        const sanitizedExamName = sanitizeStringVariables(exam);
        const sanitizedForm = sanitizeStringVariables(form);
        const sanitizedSubjectId = parseInt(subject); // subject is the ID, so convert to number

        const validPattern = /^[a-z0-9_]+$/i;
        if (
            !validPattern.test(sanitizedExamName) ||
            !validPattern.test(sanitizedForm) ||
            isNaN(sanitizedSubjectId)
        ) {
            return next(createError(400, "Invalid inputs!"));
        }

        const gradingTable = `grading_${sanitizedExamName}`;
        const subjectsTable = `subjects_form_${sanitizedForm}`;

        const allowedSubjectsTables = ['subjects_form_1', 'subjects_form_2', 'subjects_form_3', 'subjects_form_4'];
        if (!allowedSubjectsTables.includes(subjectsTable)) {
            return next(createError(400, 'Invalid form!'));
        }

        client = await pool.connect();
        await client.query('BEGIN');

        // 1. Check if grading and subjects tables exist
        const tableCheckResult = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = $1 OR table_name = $2
        `, [gradingTable, subjectsTable]);

        const existingTables = tableCheckResult.rows.map(r => r.table_name);
        if (!existingTables.includes(gradingTable) || !existingTables.includes(subjectsTable)) {
            await client.query('ROLLBACK');
            return next(createError(404, "Required tables do not exist."));
        }

        // 2. Check if subject exists with status = 1
        const subjectCheck = await client.query(
            `SELECT id FROM "${subjectsTable}" WHERE id = $1 AND status = 1 LIMIT 1`,
            [sanitizedSubjectId]
        );

        if (subjectCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return next(createError(404, "Unregistered subject."));
        }

        // 3. Fetch grading data for subject
        const gradingResult = await client.query(
            `SELECT * FROM "${gradingTable}" WHERE id = $1 LIMIT 1`,
            [sanitizedSubjectId]
        );

        if (gradingResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return next(createError(404, "Grading data not found."));
        }

        const record = gradingResult.rows[0];

        // 4. Format grading scale
        const gradingScale = {
            E: { min: record.e0, max: record.e1 },
            'D-': { min: record.dm0, max: record.dm1 },
            D: { min: record.d0, max: record.d1 },
            'D+': { min: record.dp0, max: record.dp1 },
            'C-': { min: record.cm0, max: record.cm1 },
            C: { min: record.c0, max: record.c1 },
            'C+': { min: record.cp0, max: record.cp1 },
            'B-': { min: record.bm0, max: record.bm1 },
            B: { min: record.b0, max: record.b1 },
            'B+': { min: record.bp0, max: record.bp1 },
            'A-': { min: record.am0, max: record.am1 },
            A: { min: record.a0, max: record.a1 },
        };

        await client.query('COMMIT');
        res.status(200).json(gradingScale);

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        return next(createError(500, "Internal Server Error"));
    } finally {
        if (client) client.release();
    }
};

// Fetching grading scale for all active subjects
export const allGradingScales = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(createError(415, 'Unsupported Media Type: Expected application/json'));
    }

    const { form, exam } = req.body;

    let client;

    try {
        if (!form || !exam) {
            return next(createError(400, 'Missing required parameters!'));
        }

        // Sanitize inputs and check for SQL injection
        const sanitizedExamName = sanitizeStringVariables(exam);
        const sanitizedForm = sanitizeStringVariables(form);

        const validPattern = /^[a-z0-9_]+$/i;
        if (!validPattern.test(sanitizedExamName) || !validPattern.test(sanitizedForm)) {
            return next(createError(400, "Invalid inputs!"));
        }

        const gradingTable = `grading_${sanitizedExamName}`;
        const subjectsTable = `subjects_form_${sanitizedForm}`;

        const allowedSubjectsTables = ['subjects_form_1', 'subjects_form_2', 'subjects_form_3', 'subjects_form_4'];
        if (!allowedSubjectsTables.includes(subjectsTable)) {
            return next(createError(400, 'Invalid form!'));
        }

        client = await pool.connect();
        await client.query('BEGIN');

        // 1. Check if grading and subjects tables exist
        const tableCheckResult = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = $1 OR table_name = $2
        `, [gradingTable, subjectsTable]);

        const existingTables = tableCheckResult.rows.map(r => r.table_name);
        if (!existingTables.includes(gradingTable) || !existingTables.includes(subjectsTable)) {
            await client.query('ROLLBACK');
            return next(createError(404, "Required tables do not exist."));
        }

        // 2. Get all subject id records from subjects table whose status = 1
        const activeSubjects = await client.query(
            `SELECT id, name FROM "${subjectsTable}" WHERE status = 1`
        );

        if (activeSubjects.rowCount === 0) {
            await client.query('ROLLBACK');
            return next(createError(404, "No active subjects found."));
        }

        const subjectIds = activeSubjects.rows.map(subject => subject.id);

        // 3. Query gradingTable and fetch records JOINed with subjects table
        const gradingResult = await client.query(`
            SELECT g.*, s.name as name 
            FROM "${gradingTable}" g
            JOIN "${subjectsTable}" s ON g.id = s.id
            WHERE g.id = ANY($1)
        `, [subjectIds]);

        if (gradingResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return next(createError(404, "Grading data not found for active subjects."));
        }

        // 4. Format the results for each record
        const formattedResults = gradingResult.rows.map(record => ({
            id: record.id,
            subject: record.name,
            E: { min: record.e0, max: record.e1 },
            'D-': { min: record.dm0, max: record.dm1 },
            D: { min: record.d0, max: record.d1 },
            'D+': { min: record.dp0, max: record.dp1 },
            'C-': { min: record.cm0, max: record.cm1 },
            C: { min: record.c0, max: record.c1 },
            'C+': { min: record.cp0, max: record.cp1 },
            'B-': { min: record.bm0, max: record.bm1 },
            B: { min: record.b0, max: record.b1 },
            'B+': { min: record.bp0, max: record.bp1 },
            'A-': { min: record.am0, max: record.am1 },
            A: { min: record.a0, max: record.a1 },
        }));

        await client.query('COMMIT');
        res.status(200).json(formattedResults);

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        return next(createError(500, "Internal Server Error"));
    } finally {
        if (client) client.release();
    }
};

// Updating grade system
export const updateGrading = async (req, res, next) => {
    const { e_1, exam, id } = req.body;
    const maxValue = 100;

    if (!exam || !e_1 || !id) {
        return next(createError(400, 'Required field are missing!'));
    }

    const e1 = parseInt(e_1)

    if (!Number.isInteger(parseInt(e1)) || !Number.isInteger(parseInt(id))) {
        return next(createError(400, 'Provided inputs must be integers.'));
    }

    const sanitizedExamName = sanitizeStringVariables(exam);
    const validPattern = /^[a-z0-9_]+$/i;
    if (!validPattern.test(sanitizedExamName)) {
        return next(createError(400, "Invalid exam name. Only alphanumeric and underscores allowed."));
    }

    // Ensure enough space remains for 10 sections of width 5 and a0 <= 99
    const sectionsNeeded = 10 * 5; // width of each section = 5
    const finalSectionBuffer = 1;  // a0 starts at am1 + 1
    const maxAllowedE1 = maxValue - sectionsNeeded - finalSectionBuffer;

    if (parseInt(e1) < 0 || parseInt(e1) > maxAllowedE1) {
        return next(createError(422, `Invalid E Mark Max range value. Must be between 0 and ${maxAllowedE1}.`));
    }

    const examGradingTable = `grading_${sanitizedExamName}`;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Construct 12 grading sections
            const result = {};
            let start = 0;

            result.e0 = start;
            result.e1 = e1;
            start = e1 + 1;

            const sectionKeys = [
                ['dm0', 'dm1'],
                ['d0', 'd1'],
                ['dp0', 'dp1'],
                ['cm0', 'cm1'],
                ['c0', 'c1'],
                ['cp0', 'cp1'],
                ['bm0', 'bm1'],
                ['b0', 'b1'],
                ['bp0', 'bp1'],
                ['am0', 'am1']
            ];

            for (const [low, high] of sectionKeys) {
                result[low] = start;
                result[high] = start + 4;
                start += 5;
            }

            result.a0 = start;
            result.a1 = maxValue;

            // Final validation: a0 should not be > maxValue or >= a1
            if (result.a0 > maxValue || result.a0 >= result.a1) {
                return next(createError(422, `Invalid grade allocation: Please lower Grade E Mark Max range value.`));
            }

            // Build SQL query
            const keys = Object.keys(result);
            const values = Object.values(result);
            const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
            values.push(id); // ID is last parameter

            const query = {
                text: `UPDATE ${examGradingTable} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
                values
            };

            const updateResult = await client.query(query);

            if (updateResult.rowCount === 0) {
                throw createError(404, 'Record with given subject ID not found.');
            }

            await client.query('COMMIT');

            res.status(200).json({
                status: 200,
                message: 'Grade ranges updated successfully.',
                updated: updateResult.rows[0]
            });

        } catch (err) {
            await client.query('ROLLBACK');
            return next(err);
        } finally {
            client.release();
        }

    } catch (err) {
        return next(createError(500, 'Database connection error.'));
    }
};