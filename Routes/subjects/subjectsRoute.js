
import express from 'express'
import {
  getActiveSubjects,
  getAllSubjects,
  updateSubjectStatus,
  selectiveSubjects,
  updateSelectiveSubjects,
} from "../../controllers/subjects/subjectsController.js";

import {
  getSelectivePerStream,
  getSelectiveForAllStreams,
} from "../../controllers/subjects/selectiveSubjects.js";

const router = express.Router()

// Endpoint to get Active subjects
router.post("/getsubjects", getActiveSubjects);

// Endpoint to get subjects
router.post("/getallsubjects", getAllSubjects);

// Endpoint to get subjects
router.post("/updatesubjects", updateSubjectStatus);

router.post("/selectivesubjects", selectiveSubjects);

// Endpoint for stream selective subjects students
router.post("/selectivestreamstudents", getSelectivePerStream);

// Endpoint for all selective subjects students
router.post("/selectivestudents", getSelectiveForAllStreams);

// Endpoint for updating selective subjects students
router.post("/updateselectivesubjects", updateSelectiveSubjects);


export default router