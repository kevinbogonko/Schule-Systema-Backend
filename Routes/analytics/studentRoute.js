import express from 'express'
import {
  addStudent,
  getStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getAllStudentsPerStream,
  getStudentInfo,
  // getAllFormsStudents,
  addStudentsFromExcel,
} from "../../controllers/analytics/studentCRUDController.js";
import { getStudentPhoto } from "../../controllers/analytics/students/studentPhotosController.js";
import {
  PromoteStudents,
  PromoteGradedStudents,
} from "../../controllers/analytics/students/promotionController.js";
import { uploadExcel } from '../../middlewares/excelUploadMiddleware.js';

const router = express.Router()

// Endpoint to add Student
router.post("/addstudent", addStudent)

// Endpoint to add Students from Excel
router.post("/excelstudents", uploadExcel, addStudentsFromExcel);

// Endpoint to fetch all students
router.post("/getstudents", getAllStudents)

// Endpoint to fetch all stream students
router.post("/getstreamstudents", getAllStudentsPerStream);

// Endpoint to fetch a specific student with id
router.post("/getstudent", getStudent)

// Endpoint to fetch a specific student with token decode id
router.post("/getstudentinfo", getStudentInfo);

// Endpoint to fetch a specific student with id
router.put("/updatestudent/:student_id", updateStudent)

// Endpoint to fetch a specific student with id
router.post("/deletestudent/:student_id", deleteStudent)


// STUDENT PHOTO
router.post("/getstudentphoto", getStudentPhoto);

// STUDENT PROMOTION

// Promote all form students
router.post("/promotestudents", PromoteStudents);

// Promote students on performance
router.post("/promotegradedstudents", PromoteGradedStudents);

export default router