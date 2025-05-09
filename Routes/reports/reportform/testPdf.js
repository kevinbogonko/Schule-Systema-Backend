import express from "express";
import {studentReportMarks} from '../../../controllers/reports/reportform/studentReport.js'
import {generateStudentReportPdf} from '../../../controllers/reports/reportform/reportFormController.js'

const router = express.Router();

router.post('/pdfr', async (req, res, next) => {
  try {
    // 1. Generate report data
    const reportData = await studentReportMarks(req);
    
    // // 2. Generate PDF
    const pdfBuffer = await generateStudentReportPdf(reportData);
    
    // // 3. Send PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=report.pdf',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    res.send(pdfBuffer);
    
  } catch (err) {
    next(err);
    // console.log(err)
  }
})

export default router