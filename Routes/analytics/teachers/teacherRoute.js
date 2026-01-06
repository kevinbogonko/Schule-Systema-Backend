import express from 'express'
import { addStaff, getAllStaff, getStaff, updateStaff, deleteStaff} from '../../../controllers/analytics/teachers/crudTeacherController.js'
import {
  getSubjectTeachers,
  addSubjectTeacher,
  getSubjectTeacher,
  updateSubjectTeacher,
  getSubjectTeachersWithoutConstraints,
  getAllSubjectTeachersWithoutConstraints,
  SubjectTeacherPerStream,
} from "../../../controllers/analytics/teachers/subjectTeacherController.js";
import {
  getAllClassTeachers,
  getClassTeacher,
  updateClassTeacher,
} from "../../../controllers/analytics/teachers/classTeacherController.js";
import { getStaffPhoto } from "../../../controllers/analytics/teachers/teacherPhotosController.js";

const router = express.Router()

// Endpoint to add Teacher
router.post("/addteacher", addStaff)

// Endpoint to get all Teachers
router.post("/getteachers", getAllStaff)

// Endpoint to get one Teacher
router.post("/getteacher", getStaff)

// Endpoint to update Teacher
router.put("/updateteacher/:teacher_id", updateStaff)

// Endpoint to delete Teacher
router.post("/deleteteacher/:teacher_id", deleteStaff)


// *******************SUBJECT TEACHER(S)**********************************

// Endpoint to get all SubjectTeachers
router.post("/getsubjectteachers", getSubjectTeachers)

// Endpoint to get all SubjectTeachers
router.post("/getanysubjectteachers", getSubjectTeachersWithoutConstraints);

// Endpoint to get all SubjectTeachers for all streams in all forms
router.post("/getallsubjectteachers", getAllSubjectTeachersWithoutConstraints);

// Add Subject Teacher
router.post("/addsubjectteacher", addSubjectTeacher)

// Get one Subject Teacher
router.post("/getsubjectteacher", getSubjectTeacher)

// Get Subjects set to Teacher
router.post("/getteachersubjects", SubjectTeacherPerStream);

// Update Subject Teacher
router.put("/updatesubjectteacher/:id", updateSubjectTeacher)


// *******************CLASS TEACHER(S)*************************************

// Get All Class Teachers
router.post("/getclassteachers", getAllClassTeachers)

// Get Class Teacher
router.post("/getclassteacher", getClassTeacher)

// Update Class Teacher
router.put("/updateclassteacher/:id", updateClassTeacher)


// ****************TEACHER PHOTOS ************************************
router.post("/getteacherphoto", getStaffPhoto);

export default router