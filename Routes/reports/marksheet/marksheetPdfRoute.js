import express from "express";
import { procesMarkSheet } from "../../../controllers/exams/ruExamController.js";
import { generateMarksheetPDF } from "../../../controllers/reports/marksheet/marksheetPDF.js";

const router = express.Router();

router.post("/marksheetpdf", async (req, res, next) => {
  try {
    // 1. Generate report data
    const marksheetData = await procesMarkSheet(req);

    // 2. Wrap PDF generation in a Promise to await the buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      generateMarksheetPDF(marksheetData, (err, buffer) => {
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
    next(err);
  }
});

export default router

