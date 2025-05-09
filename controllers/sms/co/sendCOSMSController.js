import { createError } from "../../../utils/ErrorHandler.js";
import { sendBulkSMS } from "../../sms/standardSMSController.js";
import { coSMSPrep } from "./coPrepController.js";

export const sendCOSMS = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const preparedCOSMS = await coSMSPrep(req);

    req.body = preparedCOSMS;
    return sendBulkSMS(req, res, next)

  } catch (err) {
    next(err);
  }
};
