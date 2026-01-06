import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

export const getSubjectConfigs = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, form, term, utility } = req.body;

  try {
    if (!year || !form || !term || !utility) {
      return next(createError(400, "Missing required parameters"));
    }

    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedForm = parseInt(sanitizeStringVariables(form));
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedUtility = sanitizeStringVariables(utility);

    const { rows: existingConfigs } = await pool.query(
      `SELECT COUNT(*) AS count FROM subjectconfig
       WHERE year = $1 AND form = $2 AND term = $3 AND utility = $4`,
      [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
    );

    if (parseInt(existingConfigs[0].count) === 0) {
      const subjectsTable = `subjects_form_${sanitizedForm}`;

      const { rows: tables } = await pool.query(
        `SELECT to_regclass($1) as exists`,
        [subjectsTable]
      );

      if (!tables[0].exists) {
        return next(
          createError(404, `Subjects table ${subjectsTable} not found`)
        );
      }

      const { rows: subjects } = await pool.query(
        `SELECT id, init FROM ${subjectsTable} WHERE status = $1`,
        [1]
      );

      if (subjects.length === 0) {
        return next(createError(404, "No active subjects found"));
      }

      const subjectConfigs = subjects.map((subject) => {
        const { id, init } = subject;
        let singles, doubles;

        if ([101, 102, 121, 122].includes(id)) {
          singles =
            sanitizedForm <= 2 ? 5 : id === 101 ? 7 : id === 102 ? 6 : 8;
          doubles = 0;
        } else if ([231, 232, 233, 236, 237].includes(id)) {
          singles = sanitizedForm <= 2 ? 2 : 3;
          doubles = 1;
        } else if ([311, 312, 313, 314, 315].includes(id)) {
          singles = sanitizedForm <= 2 ? 3 : id === 312 ? 5 : 4;
          doubles = 0;
        } else {
          singles = sanitizedForm <= 2 ? 3 : 4;
          doubles = 0;
        }

        return {
          year: sanitizedYear,
          form: sanitizedForm,
          term: sanitizedTerm,
          code: id,
          singles,
          doubles,
          iscustom: 0,
          ismerged: 0,
          merged_with: null,
          alias: init,
          utility: sanitizedUtility,
          ispaired: 0, // Default to 0 (false)
          pair: null,
          merge_alias: null,
          merge_doubles: 0, // Default to 0
          merge_singles: 0, // Default to 0
        };
      });

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertQuery = `
          INSERT INTO subjectconfig
          (year, form, term, code, singles, doubles, iscustom, ismerged, merged_with, alias, utility, ispaired, pair, merge_alias, merge_doubles, merge_singles)
          VALUES 
          ${subjectConfigs
            .map((_, i) => {
              const base = i * 16;
              return `($${base + 1}, $${base + 2}, $${base + 3}, $${
                base + 4
              }, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${
                base + 9
              }, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${
                base + 14
              }, $${base + 15}, $${base + 16})`;
            })
            .join(", ")}
        `;

        const values = subjectConfigs.flatMap((config) => [
          config.year,
          config.form,
          config.term,
          config.code,
          config.singles,
          config.doubles,
          config.iscustom,
          config.ismerged,
          config.merged_with,
          config.alias,
          config.utility,
          config.ispaired, // Will be 0
          config.pair,
          config.merge_alias,
          config.merge_doubles, // Will be 0
          config.merge_singles, // Will be 0
        ]);

        await client.query(insertQuery, values);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    const subjectsTable = `subjects_form_${sanitizedForm}`;
    const { rows: configs } = await pool.query(
      `
      SELECT sc.*, s.name
      FROM subjectconfig sc
      JOIN ${subjectsTable} s
        ON sc.code = s.id
      WHERE sc.year = $1
        AND sc.form = $2
        AND sc.term = $3
        AND sc.utility = $4
      `,
      [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
    );

    res.status(200).json(configs,
    );
  } catch (err) {
    console.error("getSubjectConfigs error:", err);
    next(err);
  }
};

// Get all configs for the set year, form, term, utility
export const getAllSubjectConfigs = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, form, term, utility } = req.body;

  try {
    if (!year || !form || !term || !utility) {
      return next(createError(400, "Missing required parameters"));
    }

    const sanitizedYear = sanitizeStringVariables(year);
    const formArray = Array.isArray(form)
      ? form.map((f) => parseInt(sanitizeStringVariables(f)))
      : [parseInt(sanitizeStringVariables(form))];
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedUtility = sanitizeStringVariables(utility);

    // Check if configs exist for all forms
    const existingConfigsPromises = formArray.map((sanitizedForm) =>
      pool.query(
        `SELECT COUNT(*) AS count FROM subjectconfig
         WHERE year = $1 AND form = $2 AND term = $3 AND utility = $4`,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      )
    );

    const existingConfigsResults = await Promise.all(existingConfigsPromises);

    // Create configs for forms that don't have them
    const createConfigPromises = formArray.map(async (sanitizedForm, index) => {
      if (parseInt(existingConfigsResults[index].rows[0].count) === 0) {
        const subjectsTable = `subjects_form_${sanitizedForm}`;

        const { rows: tables } = await pool.query(
          `SELECT to_regclass($1) as exists`,
          [subjectsTable]
        );

        if (!tables[0].exists) {
          throw createError(404, `Subjects table ${subjectsTable} not found`);
        }

        const { rows: subjects } = await pool.query(
          `SELECT id, init FROM ${subjectsTable} WHERE status = $1`,
          [1]
        );

        if (subjects.length === 0) {
          throw createError(404, "No active subjects found");
        }

        const subjectConfigs = subjects.map((subject) => {
          const { id, init } = subject;
          let singles, doubles;

          if ([101, 102, 121, 122].includes(id)) {
            singles =
              sanitizedForm <= 2 ? 5 : id === 101 ? 7 : id === 102 ? 6 : 8;
            doubles = 0;
          } else if ([231, 232, 233, 236, 237].includes(id)) {
            singles = sanitizedForm <= 2 ? 2 : 3;
            doubles = 1;
          } else if ([311, 312, 313, 314, 315].includes(id)) {
            singles = sanitizedForm <= 2 ? 3 : id === 312 ? 5 : 4;
            doubles = 0;
          } else {
            singles = sanitizedForm <= 2 ? 3 : 4;
            doubles = 0;
          }

          return {
            year: sanitizedYear,
            form: sanitizedForm,
            term: sanitizedTerm,
            code: id,
            singles,
            doubles,
            iscustom: 0,
            ismerged: 0,
            merged_with: null,
            alias: init,
            utility: sanitizedUtility,
            ispaired: 0,
            pair: null,
            merge_alias: null,
            merge_doubles: 0,
            merge_singles: 0,
          };
        });

        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          const insertQuery = `
            INSERT INTO subjectconfig
            (year, form, term, code, singles, doubles, iscustom, ismerged, merged_with, alias, utility, ispaired, pair, merge_alias, merge_doubles, merge_singles)
            VALUES 
            ${subjectConfigs
              .map((_, i) => {
                const base = i * 16;
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${
                  base + 4
                }, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${
                  base + 9
                }, $${base + 10}, $${base + 11}, $${base + 12}, $${
                  base + 13
                }, $${base + 14}, $${base + 15}, $${base + 16})`;
              })
              .join(", ")}
          `;

          const values = subjectConfigs.flatMap((config) => [
            config.year,
            config.form,
            config.term,
            config.code,
            config.singles,
            config.doubles,
            config.iscustom,
            config.ismerged,
            config.merged_with,
            config.alias,
            config.utility,
            config.ispaired,
            config.pair,
            config.merge_alias,
            config.merge_doubles,
            config.merge_singles,
          ]);

          await client.query(insertQuery, values);
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      }
    });

    await Promise.all(createConfigPromises);

    // Get configs for all forms
    const configPromises = formArray.map((sanitizedForm) => {
      const subjectsTable = `subjects_form_${sanitizedForm}`;
      return pool.query(
        `
        SELECT sc.*, s.name
        FROM subjectconfig sc
        JOIN ${subjectsTable} s
          ON sc.code = s.id
        WHERE sc.year = $1
          AND sc.form = $2
          AND sc.term = $3
          AND sc.utility = $4
        `,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      );
    });

    const configResults = await Promise.all(configPromises);
    const combinedConfigs = configResults.flatMap((result) => result.rows);

    res.status(200).json(combinedConfigs);
  } catch (err) {
    console.error("getSubjectConfigs error:", err);
    next(err);
  }
};

export const updateSubjectConfig = async (req, res, next) => {
  // Validate content type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  try {
    // Destructure request body
    const { year, term, form, utility, subjects } = req.body;

    // Validate required fields
    if (
      !year ||
      !term ||
      !form ||
      !utility ||
      !subjects ||
      !Array.isArray(subjects)
    ) {
      return next(
        createError(
          400,
          "Missing required fields: year, term, form, utility, or subjects array"
        )
      );
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Delete existing records for the given configuration
      await client.query(
        `DELETE FROM subjectconfig 
         WHERE year = $1 AND term = $2 AND form = $3 AND utility = $4`,
        [year, term, form, utility]
      );

      // Prepare and insert new subjects
      const insertPromises = subjects.map(async (subject) => {
        const {
          code,
          singles,
          doubles,
          iscustom,
          ismerged,
          merged_with,
          alias,
          ispaired,
          pair,
          merge_alias,
          merge_doubles,
          merge_singles,
        } = subject;

        // Format array fields
        const formattedMergedWith = Array.isArray(merged_with)
          ? merged_with.join(",")
          : merged_with;
        const formattedPair = Array.isArray(pair) ? pair.join(",") : pair;

        return client.query(
          `INSERT INTO subjectconfig (
            year, term, form, utility, code, singles, doubles, iscustom, 
            ismerged, merged_with, alias, ispaired, pair, merge_alias, 
            merge_doubles, merge_singles
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          ) RETURNING *`,
          [
            year,
            term,
            form,
            utility,
            code,
            singles || 0,
            doubles || 0,
            iscustom ? 1 : 0,
            ismerged ? 1 : 0,
            formattedMergedWith,
            alias || null,
            ispaired ? 1 : 0,
            formattedPair,
            merge_alias || null,
            merge_doubles || 0,
            merge_singles || 0,
          ]
        );
      });

      // Execute all inserts
      const results = await Promise.all(insertPromises);
      await client.query("COMMIT");

      // Extract inserted rows
      const insertedRows = results.map((result) => result.rows[0]);

      res.status(200).json({
        success: true,
        data: insertedRows,
        message: "Subject configuration updated successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in updateSubjectConfig:", err);
    next(
      createError(500, "Failed to update subject configuration", {
        details: err.message,
      })
    );
  }
};




// SAVING FINAL REFINED LESSONS TO GENERATE REPORTS
export const configureTTLessons = async (req, res, next) => {
  // Validate content type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, term, timetable_name, day_cluster_id, utility, lessons } =
    req.body;

  try {
    // Validate required parameters
    if (
      !year ||
      !term ||
      !timetable_name ||
      !utility ||
      !lessons ||
      !Array.isArray(lessons)
    ) {
      return next(
        createError(400, "Missing required parameters or invalid lessons data")
      );
    }

    // Sanitize string inputs
    const sanitizedTimetableName = sanitizeStringVariables(timetable_name);
    const sanitizedUtility = sanitizeStringVariables(utility);

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Delete existing records for the same parameters
      const deleteQuery = `
                DELETE FROM ttlessons 
                WHERE year = $1 
                AND term = $2 
                AND timetable_name = $3 
                AND utility = $4
            `;
      await client.query(deleteQuery, [
        year,
        term,
        sanitizedTimetableName,
        sanitizedUtility,
      ]);

      // Prepare and insert new lessons
      if (lessons.length > 0) {
        const insertQuery = `
                    INSERT INTO ttlessons (
                        year, term, timetable_name, day_cluster_id, utility,
                        alias, class_id, code, day, lesson_id, 
                        subject, teacher, teacher_tag, timeslot_id
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12, $13, $14
                    )
                `;

        // Prepare all values for batch insert
        const values = lessons.map((lesson) => [
          year,
          term,
          sanitizedTimetableName,
          day_cluster_id || null,
          sanitizedUtility,
          sanitizeStringVariables(lesson.alias) || null,
          lesson.class_id || null,
          lesson.code || null,
          sanitizeStringVariables(lesson.day) || null,
          lesson.id || null,
          sanitizeStringVariables(lesson.subject) || null,
          sanitizeStringVariables(lesson.teacher) || null,
          lesson.teacher_tag || null,
          lesson.timeSlot_id || null,
        ]);

        // Execute all inserts
        for (const valueSet of values) {
          await client.query(insertQuery, valueSet);
        }
      }

      await client.query("COMMIT");
      res.status(200).json({
        success: true,
        message: `Successfully configured ${lessons.length} lessons`,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (err) {
    next(createError(500, "Failed to configure timetable lessons", err));
  }
};

// GET TIMETABLE NAMES
export const getTimeTables = async (req, res, next) => {
  // Validate content type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { year, term } = req.body;

  try {
    // Validate required parameters
    if (!year || !term) {
      return next(
        createError(400, "Missing required parameters: year and term")
      );
    }

    // Validate parameter types
    if (typeof year !== "number" || typeof term !== "number") {
      return next(
        createError(
          400,
          "Invalid parameter types: year and term must be numbers"
        )
      );
    }

    // Query to get distinct timetable configurations grouped by utility and day_cluster_id
    const query = `
            SELECT 
                timetable_name,
                utility,
                day_cluster_id,
                COUNT(*) AS lesson_count
            FROM ttlessons
            WHERE year = $1 AND term = $2
            GROUP BY timetable_name, utility, day_cluster_id
            ORDER BY utility, day_cluster_id, timetable_name
        `;

    // Execute query with parameterized values
    const { rows } = await pool.query(query, [year, term]);

    // Transform results for better client consumption
    const result = rows.map((row) => ({
      timetableName: row.timetable_name,
      utility: row.utility,
      dayClusterId: row.day_cluster_id,
      lessonCount: row.lesson_count,
    }));

    res.status(200).json(result);
  } catch (err) {
    next(createError(500, "Failed to retrieve timetable configurations", err));
  }
};