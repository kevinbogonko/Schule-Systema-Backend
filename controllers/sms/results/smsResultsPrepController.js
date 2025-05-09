import { createError } from "../../../utils/ErrorHandler.js";
import { studentReportMarks } from "../../reports/reportform/studentReport.js";

// This prepare Students Result SMS and Sets it Format. It returns a required collection
export const studentResultsPrep = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const { selectedStudents, unival } = req.body;

    // 1. Validate selectedStudents
    if (
      !Array.isArray(selectedStudents) ||
      selectedStudents.length === 0 ||
      !selectedStudents.every((id) => Number.isInteger(Number(id)))
    ) {
      return next(
        createError(400, "Invalid or missing Phone numbers")
      );
    }

    const parsedIds = selectedStudents.map((id) => parseInt(id));

    // 2. Generate report data
    const rawReportData = await studentReportMarks(req);
    const { schoolDetails, examDetails, studentResults } = rawReportData;

    const schoolname =
      schoolDetails.find((d) => d.schoolname)?.schoolname || "";

    // 3. Filter studentResults by selected student IDs
    const matchedStudents = studentResults.filter((student) =>
      parsedIds.includes(student.id)
    );

    // 4. Construct smsList with refined messages
    const smslist = matchedStudents.map((student, index) => {
      const resultLines = (student.results || [])
        .filter((r) => r.subject)
        .map((subjectResult) => {
          const marksObj = subjectResult.marks || {};
          const mark = marksObj.mark !== undefined ? marksObj.mark : "";
          const grade = marksObj.grade !== undefined ? marksObj.grade : "";
          return `${subjectResult.subject} - ${mark}${grade}`;
        });

      const messageString =
        `${schoolname}\n\n` +
        `Name: ${student.name}\n\n` +
        `Exam: ${examDetails.examname}\n` +
        `Form: ${examDetails.form}\n` +
        `Term: ${examDetails.term}\n` +
        `Year: ${examDetails.year}\n\n` +
        resultLines.join("\n") +
        `\n\nTotal Points: ${student.total_points}\n` +
        `Stream Position: ${student.stream_position}\n` +
        `Overall Position: ${student.overal_position}\n\n`;

      return {
        partnerID: process.env.TEXTSMS_PARTNER_ID,
        apikey: process.env.TEXTSMS_API_KEY,
        pass_type: "plain",
        clientsmsid: parsedIds[index] || `sms-${index}`,
        mobile: student.phone,
        message: messageString,
        shortcode: process.env.TEXTSMS_SHORTCODE || "TextSMS",
      };
    });

    const payload = {
      count: smslist.length,
      smslist,
      unival
    };

    // res.status(200).json(payload);
    return payload;
  } catch (err) {
    next(err);
  }
};
