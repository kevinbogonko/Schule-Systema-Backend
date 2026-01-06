import { createError } from "../../../../utils/ErrorHandler.js";

export const genericSMSPrep = async (req, res, next) => {
  // 1. Destructure and validate input
  const { message, recipients, unival } = req.body;

  try {
    // Validate content type
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    // Validate required fields
    if (!message || typeof message !== "string" || message.trim() === "") {
      return next(createError(400, "Invalid or empty message"));
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return next(createError(400, "Recipients must be a non-empty array"));
    }

    if (!unival || typeof unival !== "string" || unival.trim() === "") {
      return next(createError(400, "Invalid or empty unival"));
    }

    // Validate each recipient object
    for (const recipient of recipients) {
      if (!recipient || typeof recipient !== "object") {
        return next(createError(400, "Invalid recipient format"));
      }

      if (!recipient.id || typeof recipient.id !== "number") {
        return next(createError(400, "Invalid or missing recipient id"));
      }

      if (
        !recipient.number ||
        typeof recipient.number !== "string" ||
        recipient.number.trim() === ""
      ) {
        return next(createError(400, "Invalid or empty phone number"));
      }
    }

    // 2. Generate SMS list
    const smslist = recipients.map((recipient) => {
      return {
        partnerID: process.env.TEXTSMS_PARTNER_ID,
        apikey: process.env.TEXTSMS_API_KEY,
        pass_type: "plain",
        clientsmsid:
          recipient.id.toString() ||
          `sms-${Math.random().toString(36).slice(2, 10)}`,
        mobile: recipient.number,
        message: message, // Fixed variable name from messageString to message
        shortcode: process.env.TEXTSMS_SHORTCODE || "TextSMS",
      };
    });

    // 3. Prepare payload
    const payload = {
      count: smslist.length,
      smslist,
      unival: unival,
    };

    return payload;
  } catch (err) {
    next(err);
  }
};
