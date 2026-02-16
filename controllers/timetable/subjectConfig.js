import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// We've some special subjects not included in the subjects table
const specialSubjects = [
  { value: 700, label: "LIFE SKILLS", init: "LSK" },
  { value: 800, label: "LIBRARY", init: "LIB" },
  { value: 900, label: "PASTORAL PI", init: "PPI" },
  { value: 600, label: "PHYSICAL ED.", init: "P.E" },
];

// Get Subject Configs
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
      const subjectsTable = "subjects";

      const { rows: tables } = await pool.query(
        `SELECT to_regclass($1) as exists`,
        [subjectsTable]
      );

      if (!tables[0].exists) {
        return next(createError(404, `Subjects table not found`));
      }

      // FIX 1: Add DISTINCT and ORDER BY to prevent duplicate subjects
      const { rows: subjects } = await pool.query(
        `SELECT DISTINCT id, init FROM ${subjectsTable} 
         WHERE status = $1 AND level = $2 
         ORDER BY id`,
        [1, sanitizedForm]
      );

      if (subjects.length === 0) {
        return next(createError(404, "No active subjects found"));
      }

      // FIX 2: Double-check for existing configs to prevent race conditions
      const { rows: doubleCheckConfigs } = await pool.query(
        `SELECT code FROM subjectconfig
         WHERE year = $1 AND form = $2 AND term = $3 AND utility = $4`,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      );

      const existingCodes = new Set(doubleCheckConfigs.map((ec) => ec.code));

      // Filter out subjects that already have configs (in case of race conditions)
      const subjectsToCreate = subjects.filter(
        (subject) => !existingCodes.has(subject.id)
      );

      if (subjectsToCreate.length === 0) {
        // Configs already exist, skip creation
        console.log(
          `Configs already exist for ${sanitizedYear}, Form ${sanitizedForm}, Term ${sanitizedTerm}, Utility ${sanitizedUtility}`
        );
      } else {
        // Function to get custom singles configuration based on form and subject ID
        const getCustomSinglesConfig = (form, subjectId) => {
          // For forms -1 and 0
          if (form <= 0) {
            const configMap = {
              10101: 5,
              10102: 5,
              10103: 5,
              10104: 8,
              10105: 1,
            };
            return {
              singles:
                configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
              doubles: 0,
            };
          }

          // For forms 1, 2, 3
          if (form >= 1 && form <= 3) {
            const configMap = {
              20104: 2,
              20103: 4,
              20102: 5,
              20105: 5,
              20107: 3,
              20106: 4,
              20108: 7,
            };
            return {
              singles:
                configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
              doubles: 0,
            };
          }

          // For forms 4, 5, 6
          if (form >= 4 && form <= 6) {
            const configMap = {
              30101: 5,
              30102: 4,
              30103: 5,
              30108: 3,
              30104: 4,
              30106: 4,
              30105: 3,
              30109: 6,
            };
            return {
              singles:
                configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
              doubles: 0,
            };
          }

          // For forms 7, 8, 9
          if (form >= 7 && form <= 9) {
            const configMap = {
              40101: { singles: 5, doubles: 0 },
              40102: { singles: 4, doubles: 0 },
              40103: { singles: 5, doubles: 0 },
              40109: { singles: 4, doubles: 0 },
              40106: { singles: 4, doubles: 0 },
              40104: { singles: 3, doubles: 1 },
              40107: { singles: 2, doubles: 1 },
              40110: { singles: 2, doubles: 1 },
              41108: { singles: 3, doubles: 1 },
            };
            return (
              configMap[subjectId] ?? {
                singles: 3,
                doubles: 0,
              }
            );
          }

          // Default configuration for other forms/subjects
          return {
            singles: 3,
            doubles: 0,
          };
        };

        const subjectConfigs = subjectsToCreate.map((subject) => {
          const { id, init } = subject;

          // Check if this subject ID should use custom configuration
          const customConfig = getCustomSinglesConfig(sanitizedForm, id);

          // For subjects with custom configuration
          if (customConfig.singles !== 3 || customConfig.doubles !== 0) {
            return {
              year: sanitizedYear,
              form: sanitizedForm,
              term: sanitizedTerm,
              code: id,
              singles: customConfig.singles,
              doubles: customConfig.doubles,
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
          }

          // Original logic for other subjects
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

          // FIX 3: Add ON CONFLICT clause to prevent duplicate inserts
          const insertQuery = `
            INSERT INTO subjectconfig
            (year, form, term, code, singles, doubles, iscustom, ismerged, 
             merged_with, alias, utility, ispaired, pair, merge_alias, 
             merge_doubles, merge_singles)
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
            ON CONFLICT (year, form, term, code, utility) DO NOTHING
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

          console.log(
            `Created ${subjectConfigs.length} configs for ${sanitizedYear}, Form ${sanitizedForm}, Term ${sanitizedTerm}`
          );
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("Error creating subject configs:", error);
          throw error;
        } finally {
          client.release();
        }
      }
    }

    const subjectsTable = `subjects`;

    // REAL-TIME FILTERING: Only return configs for currently active subjects
    const { rows: configs } = await pool.query(
      `
      SELECT DISTINCT ON (sc.id) sc.*, s.name, s.status
      FROM subjectconfig sc
      JOIN ${subjectsTable} s
        ON sc.code = s.id
      WHERE sc.year = $1
        AND sc.form = $2
        AND sc.term = $3
        AND sc.utility = $4
        AND s.status = 1  -- Only active subjects
        AND s.level = $2  -- Only subjects for this form level
      ORDER BY sc.id, s.name
      `,
      [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
    );

    // FIX 5: Alternative deduplication using a Map (if DISTINCT ON doesn't work)
    const uniqueConfigs = [];
    const seenIds = new Set();

    for (const config of configs) {
      if (!seenIds.has(config.id)) {
        seenIds.add(config.id);
        uniqueConfigs.push(config);
      }
    }

    // NEW: Get special subjects configs (600, 700, 800, 900)
    const { rows: specialConfigs } = await pool.query(
      `
      SELECT sc.*
      FROM subjectconfig sc
      WHERE sc.year = $1
        AND sc.form = $2
        AND sc.term = $3
        AND sc.utility = $4
        AND sc.code IN (600, 700, 800, 900)
      `,
      [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
    );

    // Format special configs to match regular subjects format
    const formattedSpecialConfigs = specialConfigs.map((config) => {
      const specialSubject = specialSubjects.find(
        (s) => s.value === config.code
      );

      return {
        ...config,
        name: specialSubject?.label,
        status: 1, // Mark as active
        level: sanitizedForm, // Add level to match regular subjects
      };
    });

    // Combine regular and special configs
    const allConfigs = [...uniqueConfigs, ...formattedSpecialConfigs];

    // Optional: Clean up configs for subjects that are no longer active
    // This helps keep the database clean
    await pool.query(
      `
      DELETE FROM subjectconfig sc
      WHERE sc.year = $1
        AND sc.form = $2
        AND sc.term = $3
        AND sc.utility = $4
        AND sc.code IN (
          SELECT sc2.code FROM subjectconfig sc2
          LEFT JOIN ${subjectsTable} s ON sc2.code = s.id
          WHERE sc2.year = $1
            AND sc2.form = $2
            AND sc2.term = $3
            AND sc2.utility = $4
            AND (s.status = 0 OR s.level != $2 OR s.id IS NULL)
        )
        AND sc.code NOT IN (600, 700, 800, 900) -- Don't delete special subjects
      `,
      [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
    );

    console.log(
      `Returning ${allConfigs.length} subject configs for Form ${sanitizedForm} (${uniqueConfigs.length} regular + ${formattedSpecialConfigs.length} special)`
    );

    res.status(200).json(allConfigs);
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

    // Check if configs exist for all forms (for active subjects only)
    const existingConfigsPromises = formArray.map((sanitizedForm) =>
      pool.query(
        `SELECT COUNT(*) AS count FROM subjectconfig sc
         JOIN subjects s ON sc.code = s.id
         WHERE sc.year = $1 
           AND sc.form = $2 
           AND sc.term = $3 
           AND sc.utility = $4
           AND s.status = 1
           AND s.level = $2`,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      )
    );

    const existingConfigsResults = await Promise.all(existingConfigsPromises);

    // Function to get custom singles configuration based on form and subject ID
    const getCustomSinglesConfig = (form, subjectId) => {
      // For forms -1 and 0
      if (form <= 0) {
        const configMap = {
          10101: 5,
          10102: 5,
          10103: 5,
          10104: 8,
          10105: 1,
        };
        return {
          singles:
            configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
          doubles: 0,
        };
      }

      // For forms 1, 2, 3
      if (form >= 1 && form <= 3) {
        const configMap = {
          20104: 2,
          20103: 4,
          20102: 5,
          20105: 5,
          20107: 3,
          20106: 4,
          20108: 7,
        };
        return {
          singles:
            configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
          doubles: 0,
        };
      }

      // For forms 4, 5, 6
      if (form >= 4 && form <= 6) {
        const configMap = {
          30101: 5,
          30102: 4,
          30103: 5,
          30108: 3,
          30104: 4,
          30106: 4,
          30105: 3,
          30109: 6,
        };
        return {
          singles:
            configMap[subjectId] !== undefined ? configMap[subjectId] : 3,
          doubles: 0,
        };
      }

      // For forms 7, 8, 9
      if (form >= 7 && form <= 9) {
        const configMap = {
          40101: { singles: 5, doubles: 0 },
          40102: { singles: 4, doubles: 0 },
          40103: { singles: 5, doubles: 0 },
          40109: { singles: 4, doubles: 0 },
          40106: { singles: 4, doubles: 0 },
          40104: { singles: 3, doubles: 1 },
          40107: { singles: 2, doubles: 1 },
          40110: { singles: 2, doubles: 1 },
          41108: { singles: 3, doubles: 1 },
        };
        return (
          configMap[subjectId] ?? {
            singles: 3,
            doubles: 0,
          }
        );
      }

      // Default configuration for other forms/subjects
      return {
        singles: 3,
        doubles: 0,
      };
    };

    // Create configs for forms that don't have them for active subjects
    const createConfigPromises = formArray.map(async (sanitizedForm, index) => {
      // Check if we need to create configs for active subjects
      const subjectsTable = `subjects`;

      const { rows: activeSubjects } = await pool.query(
        `SELECT DISTINCT id, init FROM ${subjectsTable} 
         WHERE status = $1 AND level = $2 ORDER BY id`,
        [1, sanitizedForm]
      );

      if (activeSubjects.length === 0) {
        return;
      }

      // Check which active subjects already have configs
      const { rows: existingSubjectConfigs } = await pool.query(
        `SELECT code FROM subjectconfig 
         WHERE year = $1 AND form = $2 AND term = $3 AND utility = $4
           AND code = ANY($5)`,
        [
          sanitizedYear,
          sanitizedForm,
          sanitizedTerm,
          sanitizedUtility,
          activeSubjects.map((s) => s.id),
        ]
      );

      const existingCodes = new Set(
        existingSubjectConfigs.map((ec) => ec.code)
      );

      // Filter out active subjects that already have configs
      const subjectsToCreate = activeSubjects.filter(
        (subject) => !existingCodes.has(subject.id)
      );

      if (subjectsToCreate.length === 0) {
        return;
      }

      const subjectConfigs = subjectsToCreate.map((subject) => {
        const { id, init } = subject;

        // Check if this subject ID should use custom configuration
        const customConfig = getCustomSinglesConfig(sanitizedForm, id);

        // For subjects with custom configuration
        if (customConfig.singles !== 3 || customConfig.doubles !== 0) {
          return {
            year: sanitizedYear,
            form: sanitizedForm,
            term: sanitizedTerm,
            code: id,
            singles: customConfig.singles,
            doubles: customConfig.doubles,
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
        }

        // Original logic for other subjects
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
    });

    await Promise.all(createConfigPromises);

    // Get configs for all forms - ONLY for currently active subjects
    const configPromises = formArray.map((sanitizedForm) => {
      const subjectsTable = `subjects`;
      return pool.query(
        `
        SELECT DISTINCT ON (sc.id) sc.*, s.name
        FROM subjectconfig sc
        JOIN ${subjectsTable} s
          ON sc.code = s.id
        WHERE sc.year = $1
          AND sc.form = $2
          AND sc.term = $3
          AND sc.utility = $4
          AND s.status = 1
          AND s.level = $2
        ORDER BY sc.id, s.name
        `,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      );
    });

    const configResults = await Promise.all(configPromises);

    // Get custom special subjects configs for all forms (where iscustom=1)
    const specialConfigPromises = formArray.map((sanitizedForm) => {
      return pool.query(
        `
        SELECT sc.*
        FROM subjectconfig sc
        WHERE sc.year = $1
          AND sc.form = $2
          AND sc.term = $3
          AND sc.utility = $4
          AND sc.iscustom = 1
        `,
        [
          sanitizedYear,
          sanitizedForm,
          sanitizedTerm,
          sanitizedUtility.toLowerCase(),
        ]
      );
    });

    const specialConfigResults = await Promise.all(specialConfigPromises);

    // Format and combine all configs
    const allConfigs = [];
    const configMap = new Map();

    // Process regular configs
    configResults.forEach((result) => {
      result.rows.forEach((row) => {
        if (!configMap.has(row.id)) {
          configMap.set(row.id, row);
          allConfigs.push(row);
        }
      });
    });

    // Process custom special configs
    specialConfigResults.forEach((result, index) => {
      result.rows.forEach((config) => {
        const specialSubject = specialSubjects.find(
          (s) => s.value === config.code
        );

        if (specialSubject) {
          const formattedConfig = {
            ...config,
            name: specialSubject.label,
            status: 1,
            level: formArray[index],
            iscustom: 1,
            year: config.year,
            form: config.form,
            term: config.term,
            utility: config.utility,
            code: config.code,
            singles: config.singles,
            doubles: config.doubles,
            ismerged: config.ismerged,
            merged_with: config.merged_with,
            alias: config.alias,
            ispaired: config.ispaired,
            pair: config.pair,
            merge_alias: config.merge_alias,
            merge_doubles: config.merge_doubles,
            merge_singles: config.merge_singles,
          };

          if (!configMap.has(config.id)) {
            configMap.set(config.id, formattedConfig);
            allConfigs.push(formattedConfig);
          }
        } else {
          const genericConfig = {
            ...config,
            name: `Custom Subject ${config.code}`,
            status: 1,
            level: formArray[index],
            iscustom: 1,
          };

          if (!configMap.has(config.id)) {
            configMap.set(config.id, genericConfig);
            allConfigs.push(genericConfig);
          }
        }
      });
    });

    // Optional: Clean up orphaned configs (for subjects that are no longer active)
    const cleanupPromises = formArray.map((sanitizedForm) => {
      return pool.query(
        `
        DELETE FROM subjectconfig sc
        WHERE sc.year = $1
          AND sc.form = $2
          AND sc.term = $3
          AND sc.utility = $4
          AND sc.code IN (
            SELECT sc2.code FROM subjectconfig sc2
            LEFT JOIN subjects s ON sc2.code = s.id
            WHERE sc2.year = $1
              AND sc2.form = $2
              AND sc2.term = $3
              AND sc2.utility = $4
              AND (s.status = 0 OR s.level != $2 OR s.id IS NULL)
          )
          AND sc.code NOT IN (SELECT value FROM (VALUES (600), (700), (800), (900)) AS special_codes(value))
          AND sc.iscustom = 0
        `,
        [sanitizedYear, sanitizedForm, sanitizedTerm, sanitizedUtility]
      );
    });

    await Promise.all(cleanupPromises);

    // Sort all configs by form, then by name for consistent output
    allConfigs.sort((a, b) => {
      if (a.form !== b.form) return a.form - b.form;
      if (a.name && b.name) return a.name.localeCompare(b.name);
      return a.code - b.code;
    });

    res.status(200).json(allConfigs);
  } catch (err) {
    console.error("getAllSubjectConfigs error:", err);
    next(err);
  }
};

// Update Subject Configs
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
