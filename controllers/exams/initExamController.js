import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Exam initialisation and registration endpoint
export const addExam = async (req, res, next) => {
  const { term, form, year } = req.body;

  try {
    if (!term || !form || !year) {
      throw createError(400, "Missing required parameters: term, form, year");
    }

    const sanitizedForm = sanitizeStringVariables(form);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedYear = sanitizeStringVariables(year);

    const openerTermTable = `opener_term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;
    const midTermTable = `mid_term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;
    const endTermTable = `end_term_${sanitizedTerm}_form_${sanitizedForm}_${sanitizedYear}`;
    const examsTable = `form_${sanitizedForm}_exams`;
    const studentsTable = `students_form_${sanitizedForm}`;
    const subjectsTable = `subjects_form_${sanitizedForm}`;

    const examTablesExist = await checkExamTablesExist(
      [openerTermTable, midTermTable, endTermTable],
      examsTable
    );

    if (examTablesExist) {
      await updateExistingExamTables(
        [openerTermTable, midTermTable, endTermTable],
        studentsTable
      );
      return res.status(200).json({
        success: true,
        message: "Exam tables updated successfully",
        updatedTables: [openerTermTable, midTermTable, endTermTable],
      });
    } else {
      await createNewExamTables(
        openerTermTable,
        midTermTable,
        endTermTable,
        examsTable,
        studentsTable,
        subjectsTable,
        sanitizedForm,
        sanitizedTerm,
        sanitizedYear
      );
      return res.status(201).json({
        success: true,
        message: "Exam tables created successfully",
        createdTables: [openerTermTable, midTermTable, endTermTable],
        createdGradingTables: [
          `grading_${openerTermTable}`,
          `grading_${midTermTable}`,
          `grading_${endTermTable}`,
        ],
      });
    }
  } catch (error) {
    next(error);
  }
};

async function checkExamTablesExist(examTables, examsTable) {
  const client = await pool.connect();
  try {
    const schemaCheck = await client.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_name = ANY($1)`,
      [examTables]
    );

    if (schemaCheck.rows.length !== examTables.length) return false;

    const registrationCheck = await client.query(
      `SELECT exam_name FROM ${examsTable} WHERE exam_name = ANY($1)`,
      [examTables]
    );

    return registrationCheck.rows.length === examTables.length;
  } catch (error) {
    throw createError(500, "Database error checking exam tables", {
      details: error.message,
      code: error.code,
    });
  } finally {
    client.release();
  }
}

async function updateExistingExamTables(examTables, studentsTable) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: students } = await client.query(
      `SELECT id FROM ${studentsTable}`
    );

    for (const table of examTables) {
      const { rows: missingStudents } = await client.query(
        `SELECT id 
         FROM ${studentsTable} s
         WHERE NOT EXISTS (
           SELECT 1 FROM ${table} e WHERE e.id = s.id
         )`
      );

      if (missingStudents.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < missingStudents.length; i += batchSize) {
          const batch = missingStudents.slice(i, i + batchSize);
          const values = batch.map((_, idx) => `($${idx + 1})`).join(",");
          await client.query(
            `INSERT INTO ${table} (id) VALUES ${values}`,
            batch.map((s) => s.id)
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw createError(500, "Error updating exam tables", {
      details: error.message,
      code: error.code,
    });
  } finally {
    client.release();
  }
}

async function createNewExamTables(
  openerTermTable,
  midTermTable,
  endTermTable,
  examsTable,
  studentsTable,
  subjectsTable,
  form,
  term,
  year
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: tablesExist } = await client.query(
      `SELECT EXISTS(
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = ANY($1::text[])
       ) AS exists
       FROM unnest($1::text[]) AS table_name`,
      [[studentsTable, subjectsTable]]
    );

    if (tablesExist.length < 2) {
      throw createError(400, "Required student or subject tables do not exist");
    }

    const { rows: subjects } = await client.query(
      `SELECT id FROM ${subjectsTable}`
    );

    if (subjects.length === 0) {
      throw createError(400, "No subjects found for this form");
    }

    // Modified subject columns to include _1, _2, _3
    const subjectColumns = subjects
      .map(
        (sub) => `"${sanitizeStringVariables(sub.id)}" INT DEFAULT 0,
        "${sanitizeStringVariables(sub.id)}_1" INT DEFAULT 0,
        "${sanitizeStringVariables(sub.id)}_2" INT DEFAULT 0,
        "${sanitizeStringVariables(sub.id)}_3" INT DEFAULT 0`
      )
      .join(", ");

    const createExamTable = async (tableName) => {
      try {
        await client.query(`
          CREATE TABLE ${tableName} (
            id INT PRIMARY KEY REFERENCES ${studentsTable}(id) ON DELETE CASCADE,
            ${subjectColumns}
          )`);
      } catch (error) {
        throw createError(500, `Failed to create table ${tableName}`, {
          details: error.message,
          code: error.code,
        });
      }
    };

    await createExamTable(openerTermTable);
    await createExamTable(midTermTable);
    await createExamTable(endTermTable);

    // Modified exam registration with term & year
    await client.query(
      `INSERT INTO ${examsTable} (exam_name, term, year, created_at) 
       VALUES ($1, $2, $3, NOW()), ($4, $5, $6, NOW()), ($7, $8, $9, NOW())`,
      [
        openerTermTable,
        term,
        year,
        midTermTable,
        term,
        year,
        endTermTable,
        term,
        year,
      ]
    );

    // Create grading and paper setup tables for each exam
    await createGradingTable(
      client,
      `grading_${openerTermTable}`,
      subjectsTable
    );
    await createGradingTable(client, `grading_${midTermTable}`, subjectsTable);
    await createGradingTable(client, `grading_${endTermTable}`, subjectsTable);

    await createPaperSetupTable(
      client,
      `${openerTermTable}_paper_setup`,
      subjectsTable
    );
    await createPaperSetupTable(
      client,
      `${midTermTable}_paper_setup`,
      subjectsTable
    );
    await createPaperSetupTable(
      client,
      `${endTermTable}_paper_setup`,
      subjectsTable
    );

    const populateExamTable = async (tableName) => {
      const batchSize = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { rows: students } = await client.query(
          `SELECT id FROM ${studentsTable} ORDER BY id LIMIT ${batchSize} OFFSET ${offset}`
        );

        if (students.length === 0) {
          hasMore = false;
          break;
        }

        const values = students.map((_, idx) => `($${idx + 1})`).join(",");
        await client.query(
          `INSERT INTO ${tableName} (id) VALUES ${values}`,
          students.map((s) => s.id)
        );

        offset += batchSize;
      }
    };

    await populateExamTable(openerTermTable);
    await populateExamTable(midTermTable);
    await populateExamTable(endTermTable);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function createGradingTable(client, gradingTableName, subjectsTable) {
  try {
    await client.query(`
      CREATE TABLE ${gradingTableName} (
        id INT NOT NULL PRIMARY KEY,
        subject_id INT NOT NULL REFERENCES ${subjectsTable}(id) ON DELETE CASCADE,
        e0 INT DEFAULT 0,
        e1 INT DEFAULT 29,
        dm0 INT DEFAULT 30,
        dm1 INT DEFAULT 34,
        d0 INT DEFAULT 35,
        d1 INT DEFAULT 39,
        dp0 INT DEFAULT 40,
        dp1 INT DEFAULT 44,
        cm0 INT DEFAULT 45,
        cm1 INT DEFAULT 49,
        c0 INT DEFAULT 50,
        c1 INT DEFAULT 54,
        cp0 INT DEFAULT 55,
        cp1 INT DEFAULT 59,
        bm0 INT DEFAULT 60,
        bm1 INT DEFAULT 64,
        b0 INT DEFAULT 65,
        b1 INT DEFAULT 69,
        bp0 INT DEFAULT 70,
        bp1 INT DEFAULT 74,
        am0 INT DEFAULT 75,
        am1 INT DEFAULT 79,
        a0 INT DEFAULT 80,
        a1 INT DEFAULT 100
      )`);

    const { rows: subjects } = await client.query(
      `SELECT id FROM ${subjectsTable}`
    );

    for (const subject of subjects) {
      await client.query(
        `INSERT INTO ${gradingTableName} 
         (id, subject_id)
         VALUES ($1, $2)`,
        [subject.id, subject.id]
      );
    }
  } catch (error) {
    throw createError(
      500,
      `Failed to create grading table ${gradingTableName}`,
      {
        details: error.message,
        code: error.code,
      }
    );
  }
}

async function createPaperSetupTable(client, tableName, subjectsTable) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT PRIMARY KEY REFERENCES ${subjectsTable}(id) ON DELETE CASCADE,
        papers INT NOT NULL DEFAULT 3,
        formula VARCHAR(55) NOT NULL DEFAULT 'twoPaperAvg'
      )
    `);

    const { rows: subjects } = await client.query(
      `SELECT id FROM ${subjectsTable}`
    );

    for (const subject of subjects) {
      await client.query(
        `INSERT INTO ${tableName} (id)
         VALUES ($1)
         ON CONFLICT (id) DO NOTHING`,
        [subject.id]
      );
    }
  } catch (error) {
    throw createError(500, `Failed to create paper setup table ${tableName}`, {
      details: error.message,
      code: error.code,
    });
  }
}

process.on("SIGTERM", () => {
  pool.end().catch((err) => {
    console.error("Error during shutdown", err);
  });
  process.exit(0);
});
