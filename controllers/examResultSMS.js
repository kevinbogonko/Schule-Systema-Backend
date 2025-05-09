import express from "express";
import { studentReportMarks } from "./reports/reportform/studentReport.js";

// const router = express.Router();

// router.post("/smsres", async (req, res, next) => {
export const formattedStudResult = async (req, res, next) => {
  try {
    // 1. Generate report data
    const rawReportData = await studentReportMarks(req);

    // 2. Transform the raw reportData to the refined structure
    const { schoolDetails, examDetails, studentResults } = rawReportData;

    const refinedReportData = {
      schoolDetails: {
        schoolname: schoolDetails.find((d) => d.schoolname)?.schoolname || "",
        year: examDetails.year,
        form: examDetails.form,
        term: examDetails.term,
        examname: examDetails.examname,
      },
      studentResults: studentResults
        .filter((student) => student.id)
        .map((student) => ({
          id: student.id,
          name: student.name,
          stream: student.stream,
          ag_grade: student.ag_grade,
          phone : student.phone,
          results: (student.results || [])
            .filter((r) => r.subject)
            .map((subjectResult) => {
              const marksObj = subjectResult.marks || {};
              const mark = marksObj.mark !== undefined ? marksObj.mark : "";
              const grade = marksObj.grade !== undefined ? marksObj.grade : "";
              return {
                result: `${subjectResult.subject} - ${mark}${grade}`,
              };
            }),
          total_marks: student.total_marks,
          total_points: student.total_points,
          stream_position: student.stream_position,
          overal_position: student.overal_position,
        })),
    };

    return (res.json(refinedReportData), refinedReportData);
  } catch (err) {
    next(err);
  }
}

// export default router;
