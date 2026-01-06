import pool from "../../config/db_connection.js";
import { createError } from "../../utils/ErrorHandler.js";
import { sanitizeStringVariables } from "../../utils/sanitizeString.js";

export const TTPDFData = async (req, res, next) => {
  // Validate content type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const {
    year,
    term,
    utility,
    forms,
    dayClusterId,
    stream_tag,
    teacher_tag_id,
    timetablename,
  } = req.body;

  try {
    // Validate required parameters
    if (
      !year ||
      !term ||
      !utility ||
      !forms ||
      !dayClusterId ||
      !timetablename
    ) {
      return next(
        createError(
          400,
          "Missing required parameters: year, term, utility, forms, dayClusterId, or timetablename"
        )
      );
    }

    // Sanitize inputs
    const sanitizedYear = sanitizeStringVariables(year);
    const sanitizedTerm = sanitizeStringVariables(term);
    const sanitizedUtility = sanitizeStringVariables(utility);
    const sanitizedForms = forms.map((form) => parseInt(form));
    const id = parseInt(dayClusterId);
    const sanitizedStreamTag = stream_tag ? parseInt(stream_tag) : null;
    const sanitizedTeacherTagId = teacher_tag_id
      ? parseInt(teacher_tag_id)
      : null;

    // 1. Get timeslots
    const timeSlotsQuery = `
      SELECT * 
      FROM timeslots 
      WHERE year = $1 
      AND term = $2 
      AND utility = $3
      ORDER BY starts
    `;
    const timeSlotsRes = await pool.query(timeSlotsQuery, [
      sanitizedYear,
      sanitizedTerm,
      sanitizedUtility,
    ]);
    const timeSlots = timeSlotsRes.rows.map((row, index) => ({
      id: row.id,
      label: `${row.starts.replace(/:00$/, "")} - ${row.ends.replace(
        /:00$/,
        ""
      )}`,
      type: row.category.toLowerCase(),
    }));

    // 2. Get days
    const daysQuery = {
      text: `SELECT
                monday, tuesday, wednesday, thursday, friday, saturday, sunday
              FROM day_clusters
              WHERE id = $1`,
      values: [id],
    };
    const daysRes = await pool.query(daysQuery);
    const dayValues = daysRes.rows[0];
    const days = [
      { name: "Monday", hasGames: dayValues.monday === 1 },
      { name: "Tuesday", hasGames: dayValues.tuesday === 1 },
      { name: "Wednesday", hasGames: dayValues.wednesday === 1 },
      { name: "Thursday", hasGames: dayValues.thursday === 1 },
      { name: "Friday", hasGames: dayValues.friday === 1 },
      { name: "Saturday", hasGames: dayValues.saturday === 1 },
      { name: "Sunday", hasGames: dayValues.sunday === 1 },
    ].filter((day) => day.hasGames);

    // 3. Get all streams for the set forms
    const allStreams = [];

    for (const form of sanitizedForms) {
      try {
        const result = await pool.query({
          text: `SELECT s.*, sn.stream_name FROM streams s
                   INNER JOIN stream_names sn ON s.stream_id = sn.id
                   WHERE s.form = $1 AND s.year = $2
                   ${sanitizedStreamTag ? "AND s.id = $3" : ""}
                   ORDER BY s.stream_id`,
          values: sanitizedStreamTag
            ? [form, sanitizedYear, sanitizedStreamTag]
            : [form, sanitizedYear],
        });

        if (result.rows.length > 0) {
          allStreams.push(
            ...result.rows.map((row) => ({
              id: row.id || row.sn.id,
              name: `${row.form}${row.stream_name.charAt(0).toUpperCase()}`,
              form: row.form,
              class_id: row.id,
              stream_name: row.stream_name,
            }))
          );
        }
      } catch (err) {
        if (err.code !== "42P01") {
          throw err;
        }
      }
    }

    // 4. Query the ttlessons table
    let lessonsQuery = `
      SELECT 
        id as lesson_id,
        code,
        alias,
        subject,
        teacher_tag,
        teacher,
        day,
        timeslot_id,
        class_id
      FROM ttlessons
      WHERE year = $1 AND term = $2 AND utility = $3
    `;

    let queryParams = [sanitizedYear, sanitizedTerm, sanitizedUtility];

    // Added back the conditioning set for lessons query
    if (sanitizedStreamTag) {
      lessonsQuery += " AND class_id = $4";
      queryParams.push(sanitizedStreamTag);
    } else if (sanitizedTeacherTagId) {
      lessonsQuery += " AND teacher_tag = $4";
      queryParams.push(sanitizedTeacherTagId);
    } else if (sanitizedForms.length === 1) {
      // Get all streams for this single form
      const formStreams = allStreams.filter(
        (s) => s.form === sanitizedForms[0]
      );
      if (formStreams.length > 0) {
        lessonsQuery += ` AND class_id IN (${formStreams
          .map((s) => s.class_id)
          .join(",")})`;
      }
    } else if (sanitizedForms.length > 1) {
      // Get all streams for all selected forms
      lessonsQuery += ` AND class_id IN (${allStreams
        .map((s) => s.class_id)
        .join(",")})`;
    }

    const lessonsRes = await pool.query(lessonsQuery, queryParams);

    // Format lessons according to requirements
    let lessons;
    if (sanitizedTeacherTagId) {
      // When teacher_tag_id is provided
      lessons = await Promise.all(
        lessonsRes.rows.map(async (row) => {
          // Get class tag (form + stream initial)
          let classTag = "";
          if (row.class_id) {
            const streamRes = await pool.query(
              `SELECT s.form, sn.stream_name 
               FROM streams s
               INNER JOIN stream_names sn ON s.stream_id = sn.id
               WHERE s.id = $1`,
              [row.class_id]
            );
            if (streamRes.rows.length > 0) {
              const stream = streamRes.rows[0];
              classTag = `${stream.form}${stream.stream_name
                .charAt(0)
                .toUpperCase()}`;
            }
          }

          return {
            id: row.lesson_id,
            alias: row.alias,
            day: row.day,
            timeSlot_id: row.timeslot_id,
            class_tag: classTag,
          };
        })
      );
    } else {
      // When teacher_tag_id is not provided
      lessons = lessonsRes.rows.map((row) => ({
        id: row.lesson_id,
        code: row.code,
        alias: row.alias,
        subject: row.subject,
        timeSlot_id: row.timeslot_id,
        subject_group: Array.isArray(row.subject_group)
          ? row.subject
          : [row.subject],
        teacher_tag: Array.isArray(row.teacher_tag)
          ? row.teacher_tag
          : [row.teacher_tag],
        teacher: Array.isArray(row.teacher) ? row.teacher : [row.teacher],
        day: row.day,
        class_id: row.class_id,
      }));
    }

    // 5. Fetch school particulars
    const particularsRes = await pool.query(
      "SELECT * FROM particulars WHERE id = 119"
    );
    const particulars = particularsRes.rows[0] || {
      schoolname: "KIMARU SCHOOLS",
      motto: "To the Uttermost",
      phone: "254743917360",
      address: "43844 - 00100 Nairobi",
      email: "info@kimaruschools.com",
      website: null,
      logo_path: null,
    };

    const schoolDetails = {
      schoolname: particulars.schoolname,
      motto: particulars.motto,
      address: particulars.address,
      phone: particulars.phone,
      logoPath: particulars.logo_path,
    };

    // Generate title based on selection
    let title = "";
    if (sanitizedStreamTag && allStreams.length > 0) {
      const stream = allStreams[0];
      title = `FORM ${
        stream.form
      } ${stream.stream_name.toUpperCase()} ${timetablename.toUpperCase()} ${sanitizedYear}`;
    } else if (sanitizedTeacherTagId) {
      // Get teacher name
      const teacherRes = await pool.query(
        "SELECT * FROM staff WHERE teacher_tag = $1",
        [sanitizedTeacherTagId]
      );
      const teacherName =
        teacherRes.rows.length > 0
          ? teacherRes.rows[0].title +
            " " +
            teacherRes.rows[0].fname.charAt(0).toUpperCase() +
            " " +
            teacherRes.rows[0].lname
          : "Teacher";
      title = `${teacherName} ${timetablename.toUpperCase()} ${sanitizedYear}`;
    } else if (sanitizedForms.length === 1) {
      title = `FORM ${
        sanitizedForms[0]
      } ${timetablename.toUpperCase()} ${sanitizedYear}`;
    } else {
      title = `${timetablename.toUpperCase()} ${sanitizedYear}`;
    }

    // Combine all results into one object
    const result = {
      timeSlots,
      days,
      streams: allStreams,
      lessons,
      schoolDetails,
      title,
    };

    return result
    // return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
