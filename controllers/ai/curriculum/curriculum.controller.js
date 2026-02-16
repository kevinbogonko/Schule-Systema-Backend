// controllers/ai/curriculum/curriculum.service.js

import {
  getSubtopicContent,
  searchContent,
  storeContent,
} from "../../../services/content.service.js";

import {
  getSubjects,
  getForms,
  getTopics,
  getSubtopicsByTopic,
  getCurriculumHierarchy,
  getTopicById,
  getTopicsBySubjectForm,
} from "../../../services/postgres.service.js";

/* =========================
   Get all subjects
========================= */

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await getSubjects();

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Error getting subjects:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Get all forms
========================= */

const getAllForms = async (req, res) => {
  try {
    const forms = await getForms();

    res.json({
      success: true,
      data: forms,
    });
  } catch (error) {
    console.error("Error getting forms:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Get curriculum structure by subject and form
========================= */

const getCurriculumStructure = async (req, res) => {
  try {
    const { subjectId, form } = req.query;

    let topics;

    if (subjectId && form) {
      // Get topics for specific subject and form
      topics = await getTopicsBySubjectForm(subjectId, parseInt(form));
    } else {
      // Get all topics
      topics = await getTopics(subjectId, form ? parseInt(form) : null);
    }

    // Get subtopics for each topic
    const curriculum = [];
    for (const topic of topics) {
      const subtopics = await getSubtopicsByTopic(topic.id);

      curriculum.push({
        ...topic,
        subtopics,
      });
    }

    res.json({
      success: true,
      data: curriculum,
    });
  } catch (error) {
    console.error("Error getting curriculum structure:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Get complete curriculum hierarchy
========================= */

const getCurriculumHierarchyView = async (req, res) => {
  try {
    const { subjectId, form } = req.query;

    const hierarchy = await getCurriculumHierarchy(
      subjectId,
      form ? parseInt(form) : null
    );

    // Structure the hierarchy
    const structuredData = {};

    hierarchy.forEach((row) => {
      const subjectKey = `${row.subject_code}-${row.subject_name}`;

      if (!structuredData[subjectKey]) {
        structuredData[subjectKey] = {
          subject_code: row.subject_code,
          subject_name: row.subject_name,
          subject_init: row.subject_init,
          subject_level: row.subject_level,
          forms: {},
        };
      }

      if (
        row.form_number &&
        !structuredData[subjectKey].forms[row.form_number]
      ) {
        structuredData[subjectKey].forms[row.form_number] = {
          form: row.form_number,
          topics: {},
        };
      }

      if (row.topic_id && structuredData[subjectKey].forms[row.form_number]) {
        const topicKey = `${row.topic_id}-${row.topic_name}`;

        if (
          !structuredData[subjectKey].forms[row.form_number].topics[topicKey]
        ) {
          structuredData[subjectKey].forms[row.form_number].topics[topicKey] = {
            topic_id: row.topic_id,
            topic_name: row.topic_name,
            topic_order: row.topic_order,
            subtopics: [],
          };
        }

        if (row.subtopic_id) {
          structuredData[subjectKey].forms[row.form_number].topics[
            topicKey
          ].subtopics.push({
            subtopic_id: row.subtopic_id,
            subtopic_name: row.subtopic_name,
            subtopic_code: row.subtopic_code,
          });
        }
      }
    });

    // Convert to array format
    const result = Object.values(structuredData).map((subject) => ({
      ...subject,
      forms: Object.values(subject.forms).map((formData) => ({
        ...formData,
        topics: Object.values(formData.topics),
      })),
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting curriculum hierarchy:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Get topic details
========================= */

const getTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await getTopicById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: "Topic not found",
      });
    }

    const subtopics = await getSubtopicsByTopic(topicId);

    res.json({
      success: true,
      data: {
        ...topic,
        subtopics,
      },
    });
  } catch (error) {
    console.error("Error getting topic:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Get subtopic with content
========================= */

const getSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const { includeContent } = req.query;

    const includeFullContent = includeContent === "true";

    const subtopicData = await getSubtopicContent(
      subtopicId,
      includeFullContent
    );

    if (!subtopicData) {
      return res.status(404).json({
        success: false,
        error: "Subtopic not found",
      });
    }

    res.json({
      success: true,
      data: subtopicData,
    });
  } catch (error) {
    console.error("Error getting subtopic:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Search content
========================= */

const searchCurriculumContent = async (req, res) => {
  try {
    const { q: query, subtopicId, subjectId, form, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const results = await searchContent(
      query,
      subtopicId ? Number(subtopicId) : null,
      limit ? Number(limit) : 10
    );

    // Filter by subject and form if provided
    let filteredResults = results;

    if (subjectId || form) {
      filteredResults = results.filter((result) => {
        const matchesSubject =
          !subjectId || result.subtopic?.subject_id === subjectId;
        const matchesForm = !form || result.subtopic?.form === parseInt(form);
        return matchesSubject && matchesForm;
      });
    }

    res.json({
      success: true,
      query,
      filters: { subjectId, form },
      results: filteredResults,
    });
  } catch (error) {
    console.error("Error searching content:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Add content to subtopic
========================= */

const addContent = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const { content_type, title, content, description, metadata } = req.body;

    if (!content_type || !title || !content) {
      return res.status(400).json({
        success: false,
        error: "content_type, title, and content are required",
      });
    }

    const result = await storeContent({
      subtopic_id: Number(subtopicId),
      content_type,
      title,
      content,
      description,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error adding content:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Initialize curriculum (placeholder)
========================= */

const initializeCurriculum = async (_req, res) => {
  try {
    res.json({
      success: true,
      message: "Curriculum initialization endpoint",
      note: "Use the seed-data.js script to initialize data",
    });
  } catch (error) {
    console.error("Error initializing curriculum:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================
   Exports
========================= */

export {
  getAllSubjects,
  getAllForms,
  getCurriculumStructure,
  getCurriculumHierarchyView,
  getTopic,
  getSubtopic,
  searchCurriculumContent,
  addContent,
  initializeCurriculum,
};
