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

    res.status(200).json({
      success: true,
      data: configs,
    });
  } catch (err) {
    console.error("getSubjectConfigs error:", err);
    next(err);
  }
};

export const updateSubjectConfig = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { id } = req.params;
  const {
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
  } = req.body;

  try {
    if (!id) {
      return next(createError(400, "Missing subject config ID"));
    }

    // Format merged_with array to comma-separated string if provided
    const formattedMergedWith = Array.isArray(merged_with)
      ? merged_with.join(",")
      : merged_with;

    // Format pair array to comma-separated string if provided
    const formattedPair = Array.isArray(pair) ? pair.join(",") : pair;

    const { rows } = await pool.query(
      `UPDATE subjectconfig SET
        singles = COALESCE($1, singles),
        doubles = COALESCE($2, doubles),
        iscustom = COALESCE($3, iscustom),
        ismerged = COALESCE($4, ismerged),
        merged_with = COALESCE($5, merged_with),
        alias = COALESCE($6, alias),
        ispaired = COALESCE($7, ispaired),
        pair = COALESCE($8, pair),
        merge_alias = COALESCE($9, merge_alias),
        merge_doubles = COALESCE($10, merge_doubles),
        merge_singles = COALESCE($11, merge_singles)
      WHERE id = $12
      RETURNING *`,
      [
        singles,
        doubles,
        iscustom ? 1 : 0,
        ismerged ? 1 : 0,
        formattedMergedWith,
        alias,
        ispaired ? 1 : 0, // Convert boolean to 1 or 0
        formattedPair,
        merge_alias,
        merge_doubles || 0, // Ensure default is 0 if undefined
        merge_singles || 0, // Ensure default is 0 if undefined
        id,
      ]
    );

    if (rows.length === 0) {
      return next(createError(404, "Subject config not found"));
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("updateSubjectConfig error:", err);
    next(err);
  }
};
