import express from 'express'
import {
  addStudent,
  getStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getAllStudentsPerStream,
  // getAllFormsStudents,
} from "../controllers/studentCRUDController.js";
import {getStudentPhoto} from "../controllers/students/studentPhotosController.js"

const router = express.Router()

// Endpoint to add Student
router.post("/addstudent", addStudent)

// Endpoint to fetch all students
router.post("/getstudents", getAllStudents)

// Endpoint to fetch all stream students
router.post("/getstreamstudents", getAllStudentsPerStream);

// Endpoint to fetch a specific student with id
router.post("/getstudent", getStudent)

// Endpoint to fetch a specific student with id
router.put("/updatestudent/:student_id", updateStudent)

// Endpoint to fetch a specific student with id
router.post("/deletestudent/:student_id", deleteStudent)


// STUDENT PHOTO
router.post("/getstudentphoto", getStudentPhoto);

export default router