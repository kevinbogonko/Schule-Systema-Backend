import { createError } from "../../../utils/ErrorHandler.js";
import { sendBulkSMS } from "../../sms/standardSMSController.js";
import {studentResultsPrep} from "./smsResultsPrepController.js"

export const sendStudentResultsSMS = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const preparedStudentResults = await studentResultsPrep(req)
    // req.body = { smslist: preparedStudentResults.smslist };
    // req.body = { preparedStudentResults };
    req.body = preparedStudentResults;
    return sendBulkSMS(req, res, next)

  } catch (err) {
    next(err);
  }
};
