import express from 'express'
import { generateStudentReportPdf } from "../controllers/analytics/reportFormController.js";

const router = express.Router()

// Endpoint to process Student Report Marks
router.post("/reportform", generateStudentReportPdf)


export default router