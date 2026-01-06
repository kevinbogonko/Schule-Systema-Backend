import express from 'express'
import { addExam } from "../../../controllers/analytics/exams/initExamController.js";
import {
  getAllStudentsMarks,
  getStudentMarks,
  updateStudentMark,
  updateAllStudentMark,
  examList,
  getexam,
  updateExam,
  deleteExam,
  subjectExistInExamTable,
  ExamSubjectMarks,
  allPaperSetup,
  paperSetup,
  paperSetupUpdate,
  procesMarks,
  StudentMarkListReady,
  StudentAttemptedExams,
  // StudentMarkList,
} from "../../../controllers/analytics/exams/ruExamController.js";

// Initialising Router Instance
const router = express.Router()

//
router.post("/exams", examList)
router.post("/exam", getexam);
router.post("/updateexam", updateExam);
router.post("/deleteexam", deleteExam);
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
// router.post("/marklistt", StudentMarkList);

// for student
router.post("/attemptedexam", StudentAttemptedExams);


export default router