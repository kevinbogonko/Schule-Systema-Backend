import express from "express";
import {
  getAllSubjects,
  getAllForms,
  getCurriculumStructure,
  getCurriculumHierarchyView,
  getTopic,
  getSubtopic,
  addContent,
  searchCurriculumContent,
  initializeCurriculum,
} from "../../../controllers/ai/curriculum/curriculum.controller.js";

const router = express.Router();

// Subjects and Forms
router.get("/subjects", getAllSubjects);
router.get("/forms", getAllForms);

// Curriculum Structure
router.get("/curriculum", getCurriculumStructure);
router.get("/curriculum/hierarchy", getCurriculumHierarchyView);

// Topic operations
router.get("/topic/:topicId", getTopic);

// Subtopic operations
router.get("/subtopic/:subtopicId", getSubtopic);
router.post("/subtopic/:subtopicId/content", addContent);

// Search
router.get("/search", searchCurriculumContent);

// Initialize
router.get("/initialize", initializeCurriculum);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Curriculum API",
    version: "1.0.0",
    features: [
      "subjects",
      "forms",
      "topics",
      "subtopics",
      "content-management",
      "semantic-search",
    ],
  });
});

export default router;
