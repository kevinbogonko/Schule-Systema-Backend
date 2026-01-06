import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../../utils/sanitizeString.js";

export const PromoteStudents = async (req, res, next) => {
  const { form, year } = req.body;

  try {
    // Validate and parse form and year values
    const promotion_form = parseInt(form);
    const current_academic_year = parseInt(year);

    if (isNaN(promotion_form) || isNaN(current_academic_year)) {
      throw createError(
        400,
        "Invalid form or year value. Please provide valid integers."
      );
    }

    const next_academic_year = current_academic_year + 1;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First check if there are students to promote
      const activeStudents = await client.query(
        `SELECT COUNT(*) FROM students 
                 WHERE status = 'Active' 
                 AND current_form = $1 
                 AND current_year = $2`,
        [promotion_form, current_academic_year]
      );

      const active_student_count = parseInt(activeStudents.rows[0].count);
      if (active_student_count === 0) {
        throw createError(
          400,
          `No active Form ${promotion_form} students found for year ${current_academic_year}`
        );
      }

      // Format the DO block with string interpolation (carefully sanitized)
      const promotionQuery = `
                DO $$
                DECLARE
                    promotion_form INT := ${promotion_form};
                    current_academic_year INT := ${current_academic_year};
                    next_academic_year INT := ${next_academic_year};
                    promoted_count INT := 0;
                    streams_created INT := 0;
                    history_count INT := 0;
                    existing_stream_count INT := 0;
                    stream_name_match_count INT := 0;
                BEGIN
                    -- Check existing streams
                    SELECT COUNT(*) INTO existing_stream_count
                    FROM streams 
                    WHERE form = promotion_form + 1 
                      AND year = next_academic_year;
                    
                    RAISE NOTICE 'Found % existing streams for Form % in year %', 
                        existing_stream_count, promotion_form + 1, next_academic_year;

                    -- Create missing streams
                    WITH required_stream_ids AS (
                        SELECT DISTINCT s.stream_id
                        FROM students s
                        WHERE s.status = 'Active'
                          AND s.current_form = promotion_form
                          AND s.current_year = current_academic_year
                    ),
                    existing_next_streams AS (
                        SELECT stream_id 
                        FROM streams 
                        WHERE form = promotion_form + 1 
                          AND year = next_academic_year
                    ),
                    streams_to_create AS (
                        SELECT r.stream_id
                        FROM required_stream_ids r
                        WHERE NOT EXISTS (
                            SELECT 1 FROM existing_next_streams e 
                            WHERE e.stream_id = r.stream_id
                        )
                    )
                    INSERT INTO streams (form, stream_id, teacher_id, year, status)
                    SELECT 
                        promotion_form + 1,
                        s.stream_id,
                        NULL,
                        next_academic_year,
                        1
                    FROM streams_to_create s;
                    
                    GET DIAGNOSTICS streams_created = ROW_COUNT;
                    RAISE NOTICE 'Created % new streams for Form %', streams_created, promotion_form + 1;

                    -- Promotion history
                    WITH valid_promotions AS (
                        SELECT 
                            s.id,
                            s.upi_number,
                            s.current_form,
                            s.stream_id,
                            s.stream_id AS new_stream_id
                        FROM students s
                        WHERE s.status = 'Active'
                          AND s.current_form = promotion_form
                          AND s.current_year = current_academic_year
                          AND EXISTS (
                              SELECT 1 FROM streams ns
                              WHERE ns.stream_id = s.stream_id
                                AND ns.form = promotion_form + 1
                                AND ns.year = next_academic_year
                          )
                    )
                    INSERT INTO student_promotion_history (
                        student_id, upi_number, old_form, new_form,
                        old_stream_id, new_stream_id, academic_year, promoted_at
                    )
                    SELECT 
                        id,
                        upi_number, 
                        current_form, 
                        current_form + 1,
                        stream_id, 
                        new_stream_id,
                        CONCAT(current_academic_year, '/', next_academic_year), 
                        NOW()
                    FROM valid_promotions;
                    
                    GET DIAGNOSTICS history_count = ROW_COUNT;
                    RAISE NOTICE 'Inserted % promotion history entries', history_count;

                    -- Update students
                    WITH valid_students AS (
                        SELECT 
                            s.id,
                            s.stream_id
                        FROM students s
                        WHERE s.status = 'Active'
                          AND s.current_form = promotion_form
                          AND s.current_year = current_academic_year
                          AND EXISTS (
                              SELECT 1 FROM streams ns
                              WHERE ns.stream_id = s.stream_id
                                AND ns.form = promotion_form + 1
                                AND ns.year = next_academic_year
                          )
                    )
                    UPDATE students s
                    SET 
                        current_form = promotion_form + 1,
                        current_year = next_academic_year,
                        updated_at = NOW()
                    FROM valid_students vs
                    WHERE s.id = vs.id;

                    GET DIAGNOSTICS promoted_count = ROW_COUNT;
                    RAISE NOTICE 'Successfully promoted % students from Form % to Form %', 
                        promoted_count, promotion_form, promotion_form + 1;

                    IF promoted_count = 0 THEN
                        SELECT COUNT(*) INTO stream_name_match_count
                        FROM students s
                        WHERE s.status = 'Active'
                          AND s.current_form = promotion_form
                          AND s.current_year = current_academic_year
                          AND EXISTS (
                              SELECT 1 FROM streams ns
                              WHERE ns.stream_id = s.stream_id
                                AND ns.form = promotion_form + 1
                                AND ns.year = next_academic_year
                          );
                        RAISE NOTICE 'Found % students with matching streams for next year', 
                            stream_name_match_count;

                        IF stream_name_match_count = 0 THEN
                            RAISE EXCEPTION 'No matching stream entries found for Form % in year %', 
                                promotion_form + 1, next_academic_year;
                        ELSE
                            RAISE EXCEPTION 'Promotion failed. Possible issues: Stream IDs mismatch or other database constraints';
                        END IF;
                    END IF;
                END $$;
            `;

      await client.query(promotionQuery);
      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: `Students promoted successfully from Form ${promotion_form} to Form ${
          promotion_form + 1
        }`,
      });
    } catch (dbError) {
      await client.query("ROLLBACK");

      if (
        dbError.message.includes("No active Form") ||
        dbError.message.includes("No matching stream entries")
      ) {
        throw createError(400, dbError.message);
      } else {
        console.error("Database error during promotion:", dbError);
        throw createError(500, `Promotion failed: ${dbError.message}`);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

export const PromoteGradedStudents = async (req, res, next) => {
  const { form, year, studentIds } = req.body;

  try {
    // Validate and parse input values
    const promotion_form = parseInt(form);
    const current_academic_year = parseInt(year);

    if (isNaN(promotion_form) || isNaN(current_academic_year)) {
      throw createError(
        400,
        "Invalid form or year value. Please provide valid integers."
      );
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw createError(400, "studentIds must be a non-empty array");
    }

    const parsedStudentIds = studentIds.map((id) => {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw createError(400, `Invalid student ID: ${id}`);
      }
      return parsedId;
    });

    const next_academic_year = current_academic_year + 1;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First check if there are students to promote
      const activeStudents = await client.query(
        `SELECT COUNT(*) FROM students 
         WHERE status = 'Active' 
         AND current_form = $1 
         AND current_year = $2
         AND id = ANY($3)`,
        [promotion_form, current_academic_year, parsedStudentIds]
      );

      const active_student_count = parseInt(activeStudents.rows[0].count);
      if (active_student_count === 0) {
        throw createError(
          400,
          `No active Form ${promotion_form} students found for year ${current_academic_year} with the provided IDs`
        );
      }

      // Format the DO block with string interpolation (carefully sanitized)
      const promotionQuery = `
        DO $$
        DECLARE
            promotion_form INT := ${promotion_form};
            current_academic_year INT := ${current_academic_year};
            next_academic_year INT := ${next_academic_year};
            student_ids INT[] := ARRAY[${parsedStudentIds.join(",")}];
            promoted_count INT := 0;
            streams_created INT := 0;
            history_count INT := 0;
            existing_stream_count INT := 0;
            stream_name_match_count INT := 0;
        BEGIN
            -- Check existing streams
            SELECT COUNT(*) INTO existing_stream_count
            FROM streams 
            WHERE form = promotion_form + 1 
              AND year = next_academic_year;
            
            RAISE NOTICE 'Found % existing streams for Form % in year %', 
                existing_stream_count, promotion_form + 1, next_academic_year;

            -- Create missing streams based on students being promoted
            WITH required_stream_ids AS (
                SELECT DISTINCT s.stream_id
                FROM students s
                WHERE s.status = 'Active'
                  AND s.current_form = promotion_form
                  AND s.current_year = current_academic_year
                  AND s.id = ANY(student_ids)
            ),
            existing_next_streams AS (
                SELECT stream_id 
                FROM streams 
                WHERE form = promotion_form + 1 
                  AND year = next_academic_year
            ),
            streams_to_create AS (
                SELECT r.stream_id
                FROM required_stream_ids r
                WHERE NOT EXISTS (
                    SELECT 1 FROM existing_next_streams e 
                    WHERE e.stream_id = r.stream_id
                )
            )
            INSERT INTO streams (form, stream_id, teacher_id, year, status)
            SELECT 
                promotion_form + 1,
                s.stream_id,
                NULL,
                next_academic_year,
                1
            FROM streams_to_create s;
            
            GET DIAGNOSTICS streams_created = ROW_COUNT;
            RAISE NOTICE 'Created % new streams for Form %', streams_created, promotion_form + 1;

            -- Promotion history for selected students
            WITH valid_promotions AS (
                SELECT 
                    s.id,
                    s.upi_number,
                    s.current_form,
                    s.stream_id,
                    s.stream_id AS new_stream_id
                FROM students s
                WHERE s.status = 'Active'
                  AND s.current_form = promotion_form
                  AND s.current_year = current_academic_year
                  AND s.id = ANY(student_ids)
                  AND EXISTS (
                      SELECT 1 FROM streams ns
                      WHERE ns.stream_id = s.stream_id
                        AND ns.form = promotion_form + 1
                        AND ns.year = next_academic_year
                  )
            )
            INSERT INTO student_promotion_history (
                student_id, upi_number, old_form, new_form,
                old_stream_id, new_stream_id, academic_year, promoted_at
            )
            SELECT 
                id,
                upi_number, 
                current_form, 
                current_form + 1,
                stream_id, 
                new_stream_id,
                CONCAT(current_academic_year, '/', next_academic_year), 
                NOW()
            FROM valid_promotions;
            
            GET DIAGNOSTICS history_count = ROW_COUNT;
            RAISE NOTICE 'Inserted % promotion history entries', history_count;

            -- Update selected students
            WITH valid_students AS (
                SELECT 
                    s.id,
                    s.stream_id
                FROM students s
                WHERE s.status = 'Active'
                  AND s.current_form = promotion_form
                  AND s.current_year = current_academic_year
                  AND s.id = ANY(student_ids)
                  AND EXISTS (
                      SELECT 1 FROM streams ns
                      WHERE ns.stream_id = s.stream_id
                        AND ns.form = promotion_form + 1
                        AND ns.year = next_academic_year
                  )
            )
            UPDATE students s
            SET 
                current_form = promotion_form + 1,
                current_year = next_academic_year,
                updated_at = NOW()
            FROM valid_students vs
            WHERE s.id = vs.id;

            GET DIAGNOSTICS promoted_count = ROW_COUNT;
            RAISE NOTICE 'Successfully promoted % students from Form % to Form %', 
                promoted_count, promotion_form, promotion_form + 1;

            IF promoted_count = 0 THEN
                SELECT COUNT(*) INTO stream_name_match_count
                FROM students s
                WHERE s.status = 'Active'
                  AND s.current_form = promotion_form
                  AND s.current_year = current_academic_year
                  AND s.id = ANY(student_ids)
                  AND EXISTS (
                      SELECT 1 FROM streams ns
                      WHERE ns.stream_id = s.stream_id
                        AND ns.form = promotion_form + 1
                        AND ns.year = next_academic_year
                  );
                RAISE NOTICE 'Found % students with matching streams for next year', 
                    stream_name_match_count;

                IF stream_name_match_count = 0 THEN
                    RAISE EXCEPTION 'No matching stream entries found for Form % in year %', 
                        promotion_form + 1, next_academic_year;
                ELSE
                    RAISE EXCEPTION 'Promotion failed. Possible issues: Stream IDs mismatch or other database constraints';
                END IF;
            END IF;
        END $$;
      `;

      await client.query(promotionQuery);
      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: `${active_student_count} students promoted successfully from Form ${promotion_form} to Form ${
          promotion_form + 1
        }`,
        promotedCount: active_student_count,
      });
    } catch (dbError) {
      await client.query("ROLLBACK");

      if (
        dbError.message.includes("No active Form") ||
        dbError.message.includes("No matching stream entries")
      ) {
        throw createError(400, dbError.message);
      } else {
        console.error("Database error during promotion:", dbError);
        throw createError(500, `Promotion failed: ${dbError.message}`);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};
