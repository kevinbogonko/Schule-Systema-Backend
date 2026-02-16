// services/postgres.service.js

import pool from "../config/db_connection.js";

/* =========================
   Subject operations
========================= */

const getSubjects = async () => {
  const result = await pool.query(
    "SELECT uid, id, init, name, status, isselective, level FROM subjects ORDER BY level, id"
  );
  return result.rows;
};

const getSubjectById = async (subjectId) => {
  const result = await pool.query(
    "SELECT uid, id, init, name, status, isselective, level FROM subjects WHERE id = $1",
    [subjectId]
  );
  return result.rows[0];
};

/* =========================
   Form operations
========================= */

const getForms = async () => {
  const result = await pool.query("SELECT form FROM forms ORDER BY form");
  return result.rows;
};

/* =========================
   Topic operations
========================= */

const createTopic = async (topicData) => {
  const { subject_id, form, name, description, topic_order } = topicData;

  const result = await pool.query(
    `INSERT INTO topics (subject_id, form, name, description, topic_order) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [subject_id, form, name, description, topic_order]
  );

  return result.rows[0];
};

const getTopics = async (subjectId = null, form = null) => {
  let query = "SELECT * FROM topics";
  const params = [];

  if (subjectId && form) {
    query += " WHERE subject_id = $1 AND form = $2";
    params.push(subjectId, form);
  } else if (subjectId) {
    query += " WHERE subject_id = $1";
    params.push(subjectId);
  } else if (form) {
    query += " WHERE form = $1";
    params.push(form);
  }

  query += " ORDER BY topic_order, name";

  const result = await pool.query(query, params);
  return result.rows;
};

const getTopicById = async (topicId) => {
  const result = await pool.query(
    `SELECT t.*, s.name AS subject_name, s.init AS subject_init 
     FROM topics t
     JOIN subjects s ON t.subject_id = s.id
     WHERE t.id = $1`,
    [topicId]
  );
  return result.rows[0];
};

const getTopicsBySubjectForm = async (subjectId, form) => {
  const result = await pool.query(
    `SELECT * FROM topics 
     WHERE subject_id = $1 AND form = $2 
     ORDER BY topic_order, name`,
    [subjectId, form]
  );
  return result.rows;
};

/* =========================
   Subtopic operations
========================= */

const createSubtopic = async (subtopicData) => {
  const { topic_id, name, code } = subtopicData;

  const result = await pool.query(
    "INSERT INTO subtopics (topic_id, name, code) VALUES ($1, $2, $3) RETURNING *",
    [topic_id, name, code]
  );

  return result.rows[0];
};

const getSubtopicsByTopic = async (topicId) => {
  const result = await pool.query(
    "SELECT * FROM subtopics WHERE topic_id = $1 ORDER BY code",
    [topicId]
  );
  return result.rows;
};

const getSubtopic = async (subtopicId) => {
  const result = await pool.query(
    `SELECT s.*, t.name AS topic_name, t.subject_id, t.form 
     FROM subtopics s
     JOIN topics t ON s.topic_id = t.id
     WHERE s.id = $1`,
    [subtopicId]
  );
  return result.rows[0];
};

/* =========================
   Key Points operations
========================= */

const addKeyPoints = async (subtopicId, points) => {
  const values = points
    .map(
      (point, index) =>
        `(${subtopicId}, '${point.replace(/'/g, "''")}', ${index + 1})`
    )
    .join(", ");

  const query = `
    INSERT INTO key_points (subtopic_id, point_text, point_order)
    VALUES ${values}
    RETURNING *
  `;

  const result = await pool.query(query);
  return result.rows;
};

const getKeyPoints = async (subtopicId) => {
  const result = await pool.query(
    "SELECT * FROM key_points WHERE subtopic_id = $1 ORDER BY point_order",
    [subtopicId]
  );
  return result.rows;
};

/* =========================
   Lesson Objectives operations
========================= */

const addObjectives = async (subtopicId, objectives) => {
  const values = objectives
    .map(
      (objective, index) =>
        `(${subtopicId}, '${objective.replace(/'/g, "''")}', ${index + 1})`
    )
    .join(", ");

  const query = `
    INSERT INTO lesson_objectives (subtopic_id, objective_text, objective_order)
    VALUES ${values}
    RETURNING *
  `;

  const result = await pool.query(query);
  return result.rows;
};

const getObjectives = async (subtopicId) => {
  const result = await pool.query(
    "SELECT * FROM lesson_objectives WHERE subtopic_id = $1 ORDER BY objective_order",
    [subtopicId]
  );
  return result.rows;
};

/* =========================
   Lesson Questions operations
========================= */

const addQuestions = async (subtopicId, questions) => {
  const values = questions
    .map(
      (question, index) =>
        `(${subtopicId}, '${question.replace(/'/g, "''")}', ${index + 1})`
    )
    .join(", ");

  const query = `
    INSERT INTO lesson_questions (subtopic_id, question_text, question_order)
    VALUES ${values}
    RETURNING *
  `;

  const result = await pool.query(query);
  return result.rows;
};

const getQuestions = async (subtopicId) => {
  const result = await pool.query(
    "SELECT * FROM lesson_questions WHERE subtopic_id = $1 ORDER BY question_order",
    [subtopicId]
  );
  return result.rows;
};

/* =========================
   Content Reference operations
========================= */

const createContentReference = async (contentData) => {
  const {
    subtopic_id,
    content_type,
    title,
    description,
    qdrant_point_id,
    metadata,
  } = contentData;

  const result = await pool.query(
    `INSERT INTO content_references
     (subtopic_id, content_type, title, description, qdrant_point_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [subtopic_id, content_type, title, description, qdrant_point_id, metadata]
  );

  return result.rows[0];
};

const getContentReferences = async (subtopicId, limit = 10) => {
  const result = await pool.query(
    `SELECT id, content_type, title, description,
            qdrant_point_id, metadata, created_at
     FROM content_references
     WHERE subtopic_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [subtopicId, limit]
  );
  return result.rows;
};

const getContentReferenceByQdrantId = async (qdrantId) => {
  const result = await pool.query(
    `SELECT cr.*, 
            s.name AS subtopic_name, 
            s.code AS subtopic_code,
            t.name AS topic_name,
            t.subject_id,
            t.form,
            sub.name AS subject_name,
            sub.init AS subject_init
     FROM content_references cr
     JOIN subtopics s ON cr.subtopic_id = s.id
     JOIN topics t ON s.topic_id = t.id
     JOIN subjects sub ON t.subject_id = sub.id
     WHERE cr.qdrant_point_id = $1`,
    [qdrantId]
  );

  return result.rows[0];
};

/* =========================
   Complete subtopic data
========================= */

const getSubtopicComplete = async (subtopicId) => {
  const result = await pool.query(
    `SELECT
        t.id AS topic_id,
        t.name AS topic_name,
        t.subject_id,
        t.form,
        sub.name AS subject_name,
        sub.init AS subject_init,
        s.id AS subtopic_id,
        s.name AS subtopic_name,
        s.code AS subtopic_code,
        s.created_at AS subtopic_created,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', kp.id,
              'text', kp.point_text,
              'order', kp.point_order
            )
          ) FILTER (WHERE kp.id IS NOT NULL),
          '[]'
        ) AS key_points,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', lo.id,
              'text', lo.objective_text,
              'order', lo.objective_order
            )
          ) FILTER (WHERE lo.id IS NOT NULL),
          '[]'
        ) AS objectives,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', lq.id,
              'text', lq.question_text,
              'order', lq.question_order
            )
          ) FILTER (WHERE lq.id IS NOT NULL),
          '[]'
        ) AS questions,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', cr.id,
              'type', cr.content_type,
              'title', cr.title,
              'description', cr.description,
              'qdrant_id', cr.qdrant_point_id,
              'metadata', cr.metadata,
              'created_at', cr.created_at
            )
          ) FILTER (WHERE cr.id IS NOT NULL),
          '[]'
        ) AS content_references
     FROM subtopics s
     JOIN topics t ON s.topic_id = t.id
     JOIN subjects sub ON t.subject_id = sub.id
     LEFT JOIN key_points kp ON s.id = kp.subtopic_id
     LEFT JOIN lesson_objectives lo ON s.id = lo.subtopic_id
     LEFT JOIN lesson_questions lq ON s.id = lq.subtopic_id
     LEFT JOIN content_references cr ON s.id = cr.subtopic_id
     WHERE s.id = $1
     GROUP BY t.id, sub.id, s.id`,
    [subtopicId]
  );

  return result.rows[0];
};

/* =========================
   Curriculum Hierarchy operations
========================= */

const getCurriculumHierarchy = async (subjectId = null, form = null) => {
  let query = `
    SELECT 
      s.id AS subject_code,
      s.name AS subject_name,
      s.init AS subject_init,
      s.level AS subject_level,
      f.form AS form_number,
      t.id AS topic_id,
      t.name AS topic_name,
      t.topic_order,
      st.id AS subtopic_id,
      st.name AS subtopic_name,
      st.code AS subtopic_code
    FROM subjects s
    CROSS JOIN forms f
    LEFT JOIN topics t ON t.subject_id = s.id AND t.form = f.form
    LEFT JOIN subtopics st ON st.topic_id = t.id
  `;

  const params = [];
  const whereClauses = [];

  if (subjectId) {
    whereClauses.push("s.id = $" + (params.length + 1));
    params.push(subjectId);
  }

  if (form) {
    whereClauses.push("f.form = $" + (params.length + 1));
    params.push(form);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " ORDER BY s.level, f.form, t.topic_order, st.code";

  const result = await pool.query(query, params);
  return result.rows;
};

/* =========================
   Exports
========================= */

export {
  // Subject operations
  getSubjects,
  getSubjectById,

  // Form operations
  getForms,

  // Topic operations
  createTopic,
  getTopics,
  getTopicById,
  getTopicsBySubjectForm,

  // Subtopic operations
  createSubtopic,
  getSubtopicsByTopic,
  getSubtopic,

  // Key Points operations
  addKeyPoints,
  getKeyPoints,

  // Lesson Objectives operations
  addObjectives,
  getObjectives,

  // Lesson Questions operations
  addQuestions,
  getQuestions,

  // Content Reference operations
  createContentReference,
  getContentReferences,
  getContentReferenceByQdrantId,

  // Complete data operations
  getSubtopicComplete,

  // Curriculum hierarchy
  getCurriculumHierarchy,
};
