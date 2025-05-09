import express from 'express'
import { studentReportMarks} from '../controllers/reports/reportform/studentReport.js'

const router = express.Router()

// Endpoint to process Student Report Marks
router.post("/studentreportmarks", studentReportMarks)


export default router