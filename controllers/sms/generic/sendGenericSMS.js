import { createError } from "../../../utils/ErrorHandler.js";
import { sendBulkSMS } from "../../sms/standardSMSController.js";
import { genericSMSPrep } from "./genericPrepSMSController.js";

export const sendGenericCOSMS = async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const preparedGenericSMS = await genericSMSPrep(req);

    req.body = preparedGenericSMS;
    return sendBulkSMS(req, res, next)

  } catch (err) {
    next(err);
  }
};
