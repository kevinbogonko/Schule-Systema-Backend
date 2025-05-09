import { createError } from "../../../utils/ErrorHandler.js";
import { getAllFormsStudents } from "../../studentCRUDController.js";

export const coSMSPrep = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const studentInfo = await getAllFormsStudents(req);
    const studentData = studentInfo.student_data;
    const smslist = [];

    for (const student of studentData) {
      let messageString = "";
      const {
        event,
        event_type,
        closing_date,
        signout_time,
        opening_date,
        report_time,
        details,
      } = studentInfo.events_data;
      const { fname, lname } = student;

      if (event === "closing") {
        messageString = `KIMARU SCHOOLS\n\nDear Parent/Guardian, we wish to inform you we will officially close for the ${event_type} of term ${
          studentInfo.term
        } on ${closing_date} and your child ${fname} ${lname} signs out at ${signout_time}. We will resume on ${opening_date}. ${
          details || ""
        } We appreciate your continued support and wish you a restful break. For any inquiries, please contact the school administration.`;
      } else if (event === "opening") {
        messageString = `KIMARU SCHOOLS\n\nDear Parent/Guardian, we wish to inform you we will officially open for the ${event_type} of term ${
          studentInfo.term
        } on ${opening_date} and your child ${fname} ${lname} is required to sign-in before ${report_time}. ${
          details || ""
        } For any inquiries, please contact the school administration.`;
      } else {
        continue; // Skip unknown event types
      }

      smslist.push({
        partnerID: process.env.TEXTSMS_PARTNER_ID,
        apikey: process.env.TEXTSMS_API_KEY,
        pass_type: "plain",
        clientsmsid: student.id || `sms-${Math.random().toString(36).slice(2)}`,
        mobile: student.phone,
        message: messageString,
        shortcode: process.env.TEXTSMS_SHORTCODE || "TextSMS",
      });
    }

    const payload = {
      count: smslist.length,
      smslist,
      unival : "cobulksmstest"
    };

    return payload
    // res.json(payload);
  } catch (err) {
    next(err);
  }
};
