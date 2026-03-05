import express from "express";
import { StudentMarkAnalysis } from "../../../../controllers/analytics/exams/ruExamController.js";
import { generateMarkAnalysisPDF } from "../../../../controllers/analytics/reports/analysis/markanalysis.js";

const router = express.Router();

router.post("/markanalysis", async (req, res, next) => {
  try {
    // 1. Generate report data
    const marklistData = await StudentMarkAnalysis(req);
    // console.log(marklistData?.performanceData[0]?.streams);

    // 2. Wrap PDF generation in a Promise to await the buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
        generateMarkAnalysisPDF(marklistData, (err, buffer) => {
          if (err) return reject(err);
          resolve(buffer);
        });
    });

    // 3. Send PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=marksheet.pdf",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.log(err)
    next(err);
  }
});

export default router;
