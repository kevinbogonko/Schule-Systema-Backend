
import express from 'express'
import {
  getActiveSubjects,
  getAllSubjects,
  updateSubjectStatus,
} from "../../controllers/subjects/subjectsController.js";

const router = express.Router()

// Endpoint to get Active subjects
router.post("/getsubjects", getActiveSubjects);

// Endpoint to get subjects
router.post("/getallsubjects", getAllSubjects);

// Endpoint to get subjects
router.post("/updatesubjects", updateSubjectStatus);


export default router