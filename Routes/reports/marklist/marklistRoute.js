import express from "express";
import { StudentMarkList } from "../../../controllers/exams/ruExamController.js";
import { generateMarklistPDF } from "../../../controllers/reports/marklist/marklistPDF.js";

const router = express.Router();

router.post("/marklistpdf", async (req, res, next) => {
  try {
    // 1. Generate report data
    const marklistData = await StudentMarkList(req);
    // console.log(marklistData.formattedStudents);
    // res.json(marklistData.formattedStudents);

    // 2. Wrap PDF generation in a Promise to await the buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      generateMarklistPDF(marklistData, (err, buffer) => {
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
