import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

// Constants for validation
const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const VALID_UTILITIES = ["MR", "D", "ER"];
const VALID_TERMS = [1, 2, 3];
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2000;
const MAX_YEAR = CURRENT_YEAR + 10;

/**
 * Validates day cluster input data
 */
const validateDayClusterInput = (data) => {
  const { year, term, cluster_name, days, utilities } = data;
  const errors = [];

  // Validate year
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.push(`Year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}`);
  }

  // Validate term
  if (!Number.isInteger(term) || !VALID_TERMS.includes(term)) {
    errors.push(`Term must be one of: ${VALID_TERMS.join(", ")}`);
  }

  // Validate cluster name
  if (typeof cluster_name !== "string" || cluster_name.trim().length === 0) {
    errors.push("Cluster name must not be empty");
  }

  // Validate days
  if (typeof days !== "object" || days === null) {
    errors.push("Days must be an object");
  } else {
    for (const day of VALID_DAYS) {
      if (days[day] === undefined) {
        errors.push(`Days object is missing required day: ${day}`);
      } else if (days[day] !== 0 && days[day] !== 1) {
        errors.push(`Day ${day} value must be 0 or 1`);
      }
    }
  }

  // Validate utilities
  if (typeof utilities !== "object" || utilities === null) {
    errors.push("Utilities must be an object");
  } else {
    for (const utility of VALID_UTILITIES) {
      if (utilities[utility] === undefined) {
        errors.push(`Utilities object is missing required utility: ${utility}`);
      } else if (utilities[utility] !== 0 && utilities[utility] !== 1) {
        errors.push(`Utility ${utility} value must be 0 or 1`);
      }
    }
  }

  return errors.length > 0 ? errors : null;
};

/**
 * Creates a new day cluster
 */
// export const addDayCluster = async (req, res, next) => {
//   if (!req.is("application/json")) {
//     return next(createError(415, "Expected application/json"));
//   }

//   try {
//     const { year, term, cluster_name, days, utilities } = req.body;

//     // Validate required fields
//     const requiredFields = { year, term, cluster_name, days, utilities };
//     const missingFields = Object.entries(requiredFields)
//       .filter(([_, value]) => value === undefined || value === null)
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       return next(
//         createError(400, `Missing required fields: ${missingFields.join(", ")}`)
//       );
//     }

//     // Validate input data
//     const validationErrors = validateDayClusterInput(req.body);
//     if (validationErrors) {
//       return next(createError(400, validationErrors.join(", ")));
//     }

//     // Sanitize cluster name
//     // const sanitizedClusterName = sanitizeStringVariables(cluster_name.trim());

//     // Prepare the database insert query
//     const query = {
//       text: `INSERT INTO day_clusters(
//                 year, 
//                 term, 
//                 cluster_name, 
//                 monday, tuesday, wednesday, thursday, friday, saturday, sunday,
//                 mr, d, er
//             ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//             RETURNING id`,
//       values: [
//         year,
//         term,
//         cluster_name,
//         days.Monday,
//         days.Tuesday,
//         days.Wednesday,
//         days.Thursday,
//         days.Friday,
//         days.Saturday,
//         days.Sunday,
//         utilities.MR,
//         utilities.D,
//         utilities.ER,
//       ],
//     };

//     // Execute the query
//     const result = await pool.query(query);

//     if (result.rowCount === 1) {
//       return res.status(201).json(result.rows[0]);
//     } else {
//       throw new Error("Failed to insert day cluster");
//     }
//   } catch (error) {
//     console.error("Error creating day cluster:", error);

//     // Handle database errors
//     if (error.code === "23505") {
//       return next(
//         createError(
//           409,
//           "A cluster with this name already exists for the given year and term"
//         )
//       );
//     }

//     return next(
//       createError(500, "Internal server error while creating day cluster")
//     );
//   }
// };

export const addDayCluster = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  try {
    const { year, term, cluster_name, days, utilities } = req.body;

    // Validate required fields
    const requiredFields = { year, term, cluster_name, days, utilities };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Validate input data
    const validationErrors = validateDayClusterInput(req.body);
    if (validationErrors) {
      return next(createError(400, validationErrors.join(", ")));
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Insert day cluster
      const dayClusterQuery = {
        text: `INSERT INTO day_clusters(
                year, 
                term, 
                cluster_name, 
                monday, tuesday, wednesday, thursday, friday, saturday, sunday,
                mr, d, er
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
        values: [
          year,
          term,
          cluster_name,
          days.Monday,
          days.Tuesday,
          days.Wednesday,
          days.Thursday,
          days.Friday,
          days.Saturday,
          days.Sunday,
          utilities.MR,
          utilities.D,
          utilities.ER,
        ],
      };

      const dayClusterResult = await client.query(dayClusterQuery);
      const dayClusterId = dayClusterResult.rows[0].id;

      // Generate and insert timeslots for ALL utilities (mr, d, er)
      const timeslotValues = [];
      let lessonId = 1;

      // Morning timeslots (utility = "mr") - always create these
      timeslotValues.push(
        year,
        term,
        lessonId++,
        "06:00:00",
        "07:00:00",
        "lesson",
        "mr",
        dayClusterId
      );
      timeslotValues.push(
        year,
        term,
        lessonId++,
        "07:00:00",
        "08:00:00",
        "lesson",
        "mr",
        dayClusterId
      );

      // Day timeslots (utility = "d") - always create these
      let startTime = "08:00:00";
      let endTime = "08:40:00";

      while (endTime <= "16:00:00") {
        timeslotValues.push(
          year,
          term,
          lessonId++,
          startTime,
          endTime,
          "lesson",
          "d",
          dayClusterId
        );

        // Increment times by 40 minutes
        const [startHours, startMins] = startTime.split(":").map(Number);
        const [endHours, endMins] = endTime.split(":").map(Number);

        const newStartMins = startMins + 40;
        const newEndMins = endMins + 40;

        startTime = `${String(
          startHours + Math.floor(newStartMins / 60)
        ).padStart(2, "0")}:${String(newStartMins % 60).padStart(2, "0")}:00`;
        endTime = `${String(endHours + Math.floor(newEndMins / 60)).padStart(
          2,
          "0"
        )}:${String(newEndMins % 60).padStart(2, "0")}:00`;
      }

      // Evening timeslots (utility = "er") - always create these
      timeslotValues.push(
        year,
        term,
        lessonId++,
        "17:30:00",
        "18:30:00",
        "lesson",
        "er",
        dayClusterId
      );

      // Insert all timeslots in batches
      const placeholders = [];
      const values = [];

      // Create placeholders for each timeslot (8 values per timeslot)
      for (let i = 0; i < timeslotValues.length; i += 8) {
        placeholders.push(
          `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${
            i + 6
          }, $${i + 7}, $${i + 8})`
        );
        values.push(...timeslotValues.slice(i, i + 8));
      }

      const timeslotQuery = {
        text: `INSERT INTO timeslots(
                year, term, lesson_id, starts, ends, category, utility, day_cluster_id
              ) VALUES ${placeholders.join(", ")}`,
        values: values,
      };

      await client.query(timeslotQuery);

      await client.query("COMMIT");

      return res.status(201).json({ id: dayClusterId });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating day cluster:", error);

    // Handle database errors
    if (error.code === "23505") {
      return next(
        createError(
          409,
          "A cluster with this name already exists for the given year and term"
        )
      );
    }

    return next(
      createError(500, "Internal server error while creating day cluster")
    );
  }
};


/**
 * Gets all day clusters for a specific year and term
 */
export const getDayClusters = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  try {
    const { year, term } = req.body;

    // Validate required fields
    const requiredFields = { year, term };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(
        createError(400, `Missing required fields: ${missingFields.join(", ")}`)
      );
    }

    // Validate year and term
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      return next(
        createError(400, `Year must be between ${MIN_YEAR} and ${MAX_YEAR}`)
      );
    }

    if (!Number.isInteger(term) || !VALID_TERMS.includes(term)) {
      return next(
        createError(400, `Term must be one of: ${VALID_TERMS.join(", ")}`)
      );
    }

    // Prepare and execute the database query
    const query = {
      text: `SELECT 
                id,
                year,
                term,
                cluster_name,
                monday, tuesday, wednesday, thursday, friday, saturday, sunday,
                mr, d, er
              FROM day_clusters
              WHERE year = $1 AND term = $2
              ORDER BY cluster_name`,
      values: [year, term],
    };

    const result = await pool.query(query);

    // Format the results
    const clusters = result.rows.map((row) => ({
      id: row.id,
      year: row.year,
      term: row.term,
      cluster_name: row.cluster_name,
      days: {
        Monday: row.monday,
        Tuesday: row.tuesday,
        Wednesday: row.wednesday,
        Thursday: row.thursday,
        Friday: row.friday,
        Saturday: row.saturday,
        Sunday: row.sunday,
      },
      utilities: {
        MR: row.mr,
        D: row.d,
        ER: row.er,
      },
    }));

    return res.status(200).json(clusters);
  } catch (error) {
    console.error("Error fetching day clusters:", error);
    return next(
      createError(500, "Internal server error while fetching day clusters")
    );
  }
};

/**
 * Gets a single day cluster by ID
 */
export const getDayCluster = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  try {
    const { id } = req.body;

    // Validate required field
    if (!id) {
      return next(createError(400, "Missing required field: id"));
    }

    // Validate ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "ID must be a positive integer"));
    }

    // Prepare and execute the database query
    const query = {
      text: `SELECT 
                id,
                year,
                term,
                cluster_name,
                monday, tuesday, wednesday, thursday, friday, saturday, sunday,
                mr, d, er
              FROM day_clusters
              WHERE id = $1`,
      values: [id],
    };

    const result = await pool.query(query);

    // Check if cluster exists
    if (result.rowCount === 0) {
      return next(createError(404, "Day cluster not found"));
    }

    // Format the result
    const cluster = {
      id: result.rows[0].id,
      year: result.rows[0].year,
      term: result.rows[0].term,
      cluster_name: result.rows[0].cluster_name,
      days: {
        Monday: result.rows[0].monday,
        Tuesday: result.rows[0].tuesday,
        Wednesday: result.rows[0].wednesday,
        Thursday: result.rows[0].thursday,
        Friday: result.rows[0].friday,
        Saturday: result.rows[0].saturday,
        Sunday: result.rows[0].sunday,
      },
      utilities: {
        MR: result.rows[0].mr,
        D: result.rows[0].d,
        ER: result.rows[0].er,
      },
    };

    return res.status(200).json(cluster);
  } catch (error) {
    console.error("Error fetching day cluster:", error);
    return next(
      createError(500, "Internal server error while fetching day cluster")
    );
  }
};

/**
 * Updates an existing day cluster
 */
export const updateDayCluster = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  try {
    const { cluster_name, days, utilities } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!id) {
      return next(createError(400, "Missing required field: id"));
    }

    // Validate at least one field to update is provided
    if (!cluster_name && !days && !utilities) {
      return next(
        createError(400, "At least one field to update must be provided")
      );
    }

    // Prepare update fields
    const updateFields = [];
    const updateValues = [];
    let valueIndex = 1;

    if (cluster_name) {
      if (
        typeof cluster_name !== "string" ||
        cluster_name.trim().length === 0
      ) {
        return next(
          createError(400, "Cluster name must not be empty")
        );
      }
      updateFields.push(`cluster_name = $${valueIndex++}`);
      updateValues.push(cluster_name.trim());
    }

    if (days) {
      if (typeof days !== "object" || days === null) {
        return next(createError(400, "Days must be an object"));
      }

      for (const day of VALID_DAYS) {
        if (days[day] !== undefined) {
          if (days[day] !== 0 && days[day] !== 1) {
            return next(createError(400, `Day ${day} value must be 0 or 1`));
          }
          updateFields.push(`${day.toLowerCase()} = $${valueIndex++}`);
          updateValues.push(days[day]);
        }
      }
    }

    if (utilities) {
      if (typeof utilities !== "object" || utilities === null) {
        return next(createError(400, "Utilities must be an object"));
      }

      for (const utility of VALID_UTILITIES) {
        if (utilities[utility] !== undefined) {
          if (utilities[utility] !== 0 && utilities[utility] !== 1) {
            return next(
              createError(400, `Utility ${utility} value must be 0 or 1`)
            );
          }
          updateFields.push(`${utility.toLowerCase()} = $${valueIndex++}`);
          updateValues.push(utilities[utility]);
        }
      }
    }

    // Add ID to the values array
    updateValues.push(id);

    // Prepare and execute the update query
    const query = {
      text: `UPDATE day_clusters
             SET ${updateFields.join(", ")}
             WHERE id = $${valueIndex}
             RETURNING id, year, term, cluster_name`,
      values: updateValues,
    };

    const result = await pool.query(query);

    if (result.rowCount === 0) {
      return next(createError(404, "Day cluster not found"));
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating day cluster:", error);

    if (error.code === "23505") {
      return next(createError(409, "A cluster with this name already exists"));
    }

    return next(
      createError(500, "Internal server error while updating day cluster")
    );
  }
};

/**
 * Deletes a day cluster
 */
export const deleteDayCluster = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(createError(415, "Expected application/json"));
  }

  try {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      return next(createError(400, "Missing required field: id"));
    }

    // Prepare and execute the delete query
    const query = {
      text: `DELETE FROM day_clusters
             WHERE id = $1
             RETURNING id, cluster_name`,
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rowCount === 0) {
      return next(createError(404, "Day cluster not found"));
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting day cluster:", error);

    // Handle foreign key constraint violation
    if (error.code === "23503") {
      return next(
        createError(
          409,
          "Cannot delete cluster as it is referenced by other records"
        )
      );
    }

    return next(
      createError(500, "Internal server error while deleting day cluster")
    );
  }
};
