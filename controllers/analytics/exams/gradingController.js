import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";

// Fetching grading scale for a specific subject
export const gradingScale = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { form, subject, exam_id } = req.body;
  let client;

  try {
    // Validate mandatory fields
    if (!form || !subject || !exam_id) {
      return next(
        createError(
          400,
          "Missing required parameters: form, exam, subject, exam_id"
        )
      );
    }

    // Sanitize inputs
    const sanitizedForm = Number(sanitizeStringVariables(form));
    const sanitizedSubjectId = Number(subject);
    const sanitizedExamId = Number(exam_id);

    const nonCBCForms = [19, 20, 21, 22];

    // Input validation
    if (
      isNaN(sanitizedForm) ||
      isNaN(sanitizedSubjectId) ||
      isNaN(sanitizedExamId)
    ) {
      return next(createError(400, "Invalid inputs!"));
    }

    const gradingTable = "grading_scheme";
    const subjectsTable = "subjects";

    client = await pool.connect();
    await client.query("BEGIN");

    // Check required tables exist
    const tableCheck = await client.query(
      `
      SELECT table_name FROM information_schema.tables
      WHERE table_name = $1 OR table_name = $2
      `,
      [gradingTable, subjectsTable]
    );

    const existingTables = tableCheck.rows.map((t) => t.table_name);
    if (
      !existingTables.includes(gradingTable) ||
      !existingTables.includes(subjectsTable)
    ) {
      await client.query("ROLLBACK");
      return next(createError(404, "Required tables do not exist"));
    }

    // Validate subject exists & active
    const subjectCheck = await client.query(
      `SELECT id FROM "${subjectsTable}" WHERE id = $1 AND status = 1 AND level = $2 LIMIT 1`,
      [sanitizedSubjectId, sanitizedForm]
    );

    if (subjectCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      const label = nonCBCForms.includes(sanitizedForm)
        ? "subject"
        : "learning area";
      return next(createError(404, `Unregistered ${label}.`));
    }

    // Fetch grading record
    const gradingResult = await client.query(
      `SELECT * FROM "${gradingTable}" WHERE subject_id = $1 AND exam_id = $2 LIMIT 1`,
      [sanitizedSubjectId, sanitizedExamId]
    );

    if (gradingResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return next(createError(404, "Grading data not found."));
    }

    const record = gradingResult.rows[0];

    // Build grading scale response
    let gradingScale = {};

    if (nonCBCForms.includes(sanitizedForm)) {
      gradingScale = {
        E: { min: record.e0, max: record.e1 },
        "D-": { min: record.dm0, max: record.dm1 },
        D: { min: record.d0, max: record.d1 },
        "D+": { min: record.dp0, max: record.dp1 },
        "C-": { min: record.cm0, max: record.cm1 },
        C: { min: record.c0, max: record.c1 },
        "C+": { min: record.cp0, max: record.cp1 },
        "B-": { min: record.bm0, max: record.bm1 },
        B: { min: record.b0, max: record.b1 },
        "B+": { min: record.bp0, max: record.bp1 },
        "A-": { min: record.am0, max: record.am1 },
        A: { min: record.a0, max: record.a1 },
      };
    } else {
      gradingScale = {
        BE: { min: record.be0, max: record.be1 },
        AE: { min: record.ae0, max: record.ae1 },
        ME: { min: record.me0, max: record.me1 },
        EE: { min: record.ee0, max: record.ee1 },
      };
    }

    await client.query("COMMIT");
    return res.status(200).json(gradingScale);
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    return next(createError(500, "Internal Server Error"));
  } finally {
    if (client) client.release();
  }
};

// Fetching grading scale for all active subjects
export const allGradingScales = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { form, exam } = req.body;
  let client;

  try {
    // Validate mandatory fields
    if (!form || !exam) {
      return next(createError(400, "Missing required parameters: form, exam"));
    }

    // Sanitize inputs
    const sanitizedExamName = sanitizeStringVariables(exam);
    const sanitizedForm = sanitizeStringVariables(form);

    // Validate allowed characters
    const validPattern = /^[a-z0-9_]+$/i;
    if (
      !validPattern.test(sanitizedExamName) ||
      !validPattern.test(sanitizedForm)
    ) {
      return next(createError(400, "Invalid characters in input"));
    }

    const gradingTable = "grading_scheme";
    const subjectsTable = "subjects";

    client = await pool.connect();
    await client.query("BEGIN");

    // Ensure required tables exist
    const tableCheck = await client.query(
      `
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_name = $1 OR table_name = $2
      `,
      [gradingTable, subjectsTable]
    );

    const existingTables = tableCheck.rows.map((t) => t.table_name);
    if (
      !existingTables.includes(gradingTable) ||
      !existingTables.includes(subjectsTable)
    ) {
      await client.query("ROLLBACK");
      return next(createError(404, "Required tables do not exist"));
    }

    // Get subjects with status = 1
    const subjectsResult = await client.query(
      `SELECT id, name FROM "${subjectsTable}" WHERE status = 1 AND level = $1`,
      [form]
    );

    if (subjectsResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return next(createError(404, "No active subjects/learning areas found"));
    }

    const subjectIds = subjectsResult.rows.map((sub) => sub.id);

    // Get grading data for subjects
    const gradingResult = await client.query(
      `
      SELECT g.*, s.name 
      FROM "${gradingTable}" g
      JOIN "${subjectsTable}" s ON g.subject_id = s.id
      WHERE g.subject_id = ANY($1) AND s.level = $2
      `,
      [subjectIds, form]
    );

    if (gradingResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return next(
        createError(404, "Grading data not found for active subjects")
      );
    }

    // Format output
    let formattedResults = [];
    const nonCBCForms = [19, 20, 21, 22];

    if (nonCBCForms.includes(Number(form))) {
      formattedResults = gradingResult.rows.map((record) => ({
        id: record.subject_id,
        subject: record.name,
        E: { min: record.e0, max: record.e1 },
        "D-": { min: record.dm0, max: record.dm1 },
        D: { min: record.d0, max: record.d1 },
        "D+": { min: record.dp0, max: record.dp1 },
        "C-": { min: record.cm0, max: record.cm1 },
        C: { min: record.c0, max: record.c1 },
        "C+": { min: record.cp0, max: record.cp1 },
        "B-": { min: record.bm0, max: record.bm1 },
        B: { min: record.b0, max: record.b1 },
        "B+": { min: record.bp0, max: record.bp1 },
        "A-": { min: record.am0, max: record.am1 },
        A: { min: record.a0, max: record.a1 },
      }));
    } else {
      formattedResults = gradingResult.rows.map((record) => ({
        id: record.subject_id,
        subject: record.name,
        BE: { min: record.be0, max: record.be1 },
        AE: { min: record.ae0, max: record.ae1 },
        ME: { min: record.me0, max: record.me1 },
        EE: { min: record.ee0, max: record.ee1 },
      }));
    }

    await client.query("COMMIT");
    return res.status(200).json(formattedResults);
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    return next(createError(500, "Internal Server Error"));
  } finally {
    if (client) client.release();
  }
};

// Updating grade system
export const updateGrading = async (req, res, next) => {
  // 1. Ensure request is JSON
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2. Destructure request body and define constants
  const { form, e_1, exam_id, subject_id } = req.body;
  const MAX_VALUE = 100;
  const TEN_PARTITIONS_FORMS = [19, 20, 21, 22];
  const client = await pool.connect();

  try {
    // 3. Basic presence validation
    if (
      form === undefined ||
      e_1 === undefined ||
      exam_id === undefined ||
      subject_id === undefined
    ) {
      return next(
        createError(
          400,
          "Required fields are missing!"
        )
      );
    }

    // 4. Parse numeric inputs
    const parsedForm = Number(form);
    const parsedE1 = Number(e_1);
    const parsedExamId = Number(exam_id);
    const parsedSubjectId = Number(subject_id);

    // 5. Validate numeric parsing
    if (
      Number.isNaN(parsedForm) ||
      Number.isNaN(parsedE1) ||
      Number.isNaN(parsedExamId) ||
      Number.isNaN(parsedSubjectId)
    ) {
      return next(createError(400, "Provided inputs must be valid numbers."));
    }

    // 6. Additional validation: ranges must be integers and within 0..100
    if (
      !Number.isInteger(parsedForm) ||
      !Number.isInteger(parsedE1) ||
      !Number.isInteger(parsedExamId) ||
      !Number.isInteger(parsedSubjectId)
    ) {
      return next(createError(400, "Provided inputs must be integers."));
    }
    if (parsedE1 < 0 || parsedE1 > MAX_VALUE) {
      return next(
        createError(
          422,
          `Score upper bound must be between 0 and ${MAX_VALUE}.`
        )
      );
    }

    // 7. Start transaction
    await client.query("BEGIN");

    // 8. Prepare update payload
    const updates = {};

    if (TEN_PARTITIONS_FORMS.includes(parsedForm)) {
      // 9. TEN-PARTITION logic (8-4-4 style): keep previous behavior where remaining partitions use width 5
      const sectionsNeeded = 10 * 5; // 10 sections x width 5
      const finalSectionBuffer = 1;
      const maxAllowedE1 = MAX_VALUE - sectionsNeeded - finalSectionBuffer;

      if (parsedE1 < 0 || parsedE1 > maxAllowedE1) {
        await client.query("ROLLBACK");
        return next(
          createError(
            422,
            `Invalid ${
              TEN_PARTITIONS_FORMS.includes(parsedForm) ? "E Mark" : "BE Score"
            } Max range value. Must be between 0 and ${maxAllowedE1}.`
          )
        );
      }

      let start = 0;
      updates.e0 = start;
      updates.e1 = parsedE1;
      start = parsedE1 + 1;

      const sectionKeys = [
        ["dm0", "dm1"],
        ["d0", "d1"],
        ["dp0", "dp1"],
        ["cm0", "cm1"],
        ["c0", "c1"],
        ["cp0", "cp1"],
        ["bm0", "bm1"],
        ["b0", "b1"],
        ["bp0", "bp1"],
        ["am0", "am1"],
      ];

      for (const [low, high] of sectionKeys) {
        updates[low] = start;
        updates[high] = start + 4; // width 5 => start .. start+4
        start += 5;
      }

      updates.a0 = start;
      updates.a1 = MAX_VALUE;

      // sanity check
      if (updates.a0 > MAX_VALUE || updates.a0 >= updates.a1) {
        await client.query("ROLLBACK");
        return next(
          createError(
            422,
            "Invalid grade allocation: adjust Score upper bound to allow full partitions."
          )
        );
      }
    } else {
      // 10. NON-TEN forms (CBC-like) — user sets be1 (we use e_1 as be1), be0 is 0
      const be0 = 0;
      const be1 = parsedE1;

      if (be1 < 0 || be1 >= MAX_VALUE) {
        await client.query("ROLLBACK");
        return next(
          createError(
            422,
            "Score upper bound must be between 0 and 99 (cannot be 100)."
          )
        );
      }

      updates.be0 = be0;
      updates.be1 = be1;

      // Remaining marks to split equally into AE, ME, EE
      const remaining = MAX_VALUE - be1;
      const baseSize = Math.floor(remaining / 3); // A: remainder goes to EE (Option A)
      let start = be1 + 1;

      // AE
      updates.ae0 = start;
      updates.ae1 = start + baseSize - 1;
      start = updates.ae1 + 1;

      // ME
      updates.me0 = start;
      updates.me1 = start + baseSize - 1;
      start = updates.me1 + 1;

      // EE gets the remainder up to MAX_VALUE
      updates.ee0 = start;
      updates.ee1 = MAX_VALUE;

      // Handle edge cases where baseSize is 0 (e.g., be1 is close to 100)
      if (updates.ae1 < updates.ae0) updates.ae1 = updates.ae0 - 1; // produce empty range if necessary
      if (updates.me1 < updates.me0) updates.me1 = updates.me0 - 1;

      // final sanity: ee0 must be <= ee1 and ee1 == MAX_VALUE
      if (updates.ee0 > updates.ee1 || updates.ee1 !== MAX_VALUE) {
        await client.query("ROLLBACK");
        return next(
          createError(422, "Invalid partition distribution for BE/AE/ME/EE.")
        );
      }
    }

    // 11. Build parameterized UPDATE using subject_id + uni_val (uni_val = exam_id + subject_id concatenation)
    const uniVal = `${parsedExamId}${parsedSubjectId}`;
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      await client.query("ROLLBACK");
      return next(createError(400, "No allocations computed."));
    }

    const values = keys.map((k) => updates[k]);
    // Append WHERE parameters in order: subject_id, uni_val
    values.push(parsedSubjectId);
    values.push(uniVal);

    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    const whereSubjectIndex = values.length - 1; // position of parsedSubjectId
    const whereUniValIndex = values.length; // position of uniVal

    const sql = {
      text: `UPDATE "grading_scheme" SET ${setClause} WHERE subject_id = $${whereSubjectIndex} AND uni_val = $${whereUniValIndex} RETURNING *`,
      values,
    };

    // 12. Execute update
    const updateResult = await client.query(sql);

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return next(
        createError(404, "Record not found!") // Record with given subject_id and uni_val not found
      );
    }

    // 13. Commit and respond
    await client.query("COMMIT");
    return res.status(200).json({
      status: 200,
      message: "Grade ranges updated successfully.",
      updated: updateResult.rows[0],
    });
  } catch (err) {
    // 14. Rollback on any error
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      /* ignore */
    }
    return next(err);
  } finally {
    // 15. Ensure client release
    client.release();
  }
};