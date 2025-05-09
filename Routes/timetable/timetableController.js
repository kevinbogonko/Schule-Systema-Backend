import express from 'express'
import { generateSchoolTimetable } from "../../controllers/timetable/generateTimeTableController.js";

const router = express.Router()

// User Registration Endpoint
router.get("/timetable", generateSchoolTimetable);


export default router