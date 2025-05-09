import express from 'express'
import { addExam } from "../../controllers/exams/initExamController.js"
import {
  getAllStudentsMarks,
  getStudentMarks,
  updateStudentMark,
  updateAllStudentMark,
  examList,
  subjectExistInExamTable,
  ExamSubjectMarks,
  allPaperSetup,
  paperSetup,
  paperSetupUpdate,
  procesMarks,
  StudentMarkListReady,
} from "../../controllers/exams/ruExamController.js";

// Initialising Router Instance
const router = express.Router()

//
router.post("/exams", examList)
router.post("/examsubject", subjectExistInExamTable)
router.post("/subjectmarks", ExamSubjectMarks)
router.post("/allpapersetup", allPaperSetup)
router.post("/papersetup", paperSetup)
router.put("/updatepapersetup", paperSetupUpdate)

// router.post("/addExam", transactional, registerExam)
router.post("/addexam", addExam)
router.post("/allmarks", getAllStudentsMarks)
router.post("/mark", getStudentMarks)
router.put("/updatemark", updateStudentMark)
router.put("/updatemarks", updateAllStudentMark)
router.post("/processmarks", procesMarks)
router.post("/marklist", StudentMarkListReady);

export default router