import express from "express";
import { studentReportMarks } from "../../../controllers/reports/reportform/studentReport.js";
import { generateStudentReportPdf } from "../../../controllers/reports/reportform/reportFormController.js";

const router = express.Router();

router.post("/pdfr", async (req, res, next) => {
  try {
    // 1. Generate report data
    const reportData = await studentReportMarks(req);

    // 2. Extract studentIds
    const setStudents = reportData?.studentIds;

    let filteredData;

    // 3. Check if studentIds is non-empty and filter accordingly
    if (Array.isArray(setStudents) && setStudents.length > 0) {
      filteredData = {
        ...reportData,
        studentResults: reportData.studentResults.filter((student) =>
          setStudents.includes(student.id)
        ),
      };
    } else {
      filteredData = reportData;
    }


    // 4. Generate PDF
    const pdfBuffer = await generateStudentReportPdf(filteredData);

    // 5. Send PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=student_reportform.pdf",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
