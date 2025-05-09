import { createError } from "../../utils/ErrorHandler.js";
import axios from "axios";
import pool from "../../config/db_connection.js";

// Configuration
const BATCH_SIZE = 20;
const RATE_LIMIT_DELAY_MS = 500;

// Helper function to check internet connection
const checkInternetConnection = async () => {
  try {
    await axios.get("https://www.google.com", { timeout: 3000 });
    return true;
  } catch (err) {
    return false;
  }
};

const checkSMSBalance = async () => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection available");
    }

    const response = await axios.post(
      `${process.env.TEXT_SMS_API_BASE_URL}/getbalance/`,
      {
        apikey: process.env.TEXTSMS_API_KEY,
        partnerID: process.env.TEXTSMS_PARTNER_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 3000,
      }
    );

    // Validate response structure
    if (!response.data || response.data["response-code"] !== 200) {
      throw new Error(
        response.data?.["response-description"] || "Invalid balance response"
      );
    }

    // Extract and convert credit balance
    const creditBalance = parseFloat(response.data.credit);
    if (isNaN(creditBalance)) {
      throw new Error(`Invalid credit value: ${response.data.credit}`);
    }

    return creditBalance;
  } catch (err) {
    throw createError(
      500,
      `Balance check failed: ${
        err.response?.data?.["response-description"] || err.message
      }`
    );
  }
};

export const sendBulkSMS = async (req, res, next) => {
  try {
    const { smslist, unival } = req.body;

    // Check internet connection first
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return next(createError(503, "No internet connection available"));
    }

    // Validate input
    if (!req.body || typeof req.body !== "object") {
      return next(createError(400, "Request body must be an object"));
    }

    if (!smslist || !Array.isArray(smslist)) {
      return next(
        createError(400, "SMS List array is required in the request object")
      );
    }

    if (smslist.length === 0) {
      return next(createError(400, "SMS List cannot be empty"));
    }

    // Check balance before processing
    const balance = await checkSMSBalance();
    if (balance < smslist.length) {
      return next(
        createError(
          402,
          `Insufficient SMS credits. Available: ${balance}, Required: ${smslist.length}`
        )
      );
    }

    // Validate and format mobile numbers
    const validatedsmslist = smslist.map((sms) => {
      const formattedMobile = formatMobileNumber(sms.mobile);
      if (!formattedMobile) {
        throw createError(400, `Invalid mobile number: ${sms.mobile}`);
      }
      return {
        ...sms,
        mobile: formattedMobile,
      };
    });

    // Process in batches
    const results = await processBatches(validatedsmslist, unival);

    // Store results in database
    await storeResultsInDatabase(results, unival);

    res.status(200).json({
      success: true,
      count: smslist.length,
      results,
      metadata: req.body.metadata || {},
    });
  } catch (err) {
    next(createError(500, `Bulk SMS processing failed: ${err.message}`));
  }
};

const storeResultsInDatabase = async (results, unival) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const result of results) {
      const {
        clientsmsid,
        mobile,
        messageId,
        responseCode,
        description,
        timestamp,
        success,
      } = result;
      const student_unival = `${clientsmsid}${unival}`;

      await client.query(
        `INSERT INTO smslogs 
        (student_id, phone, message_id, response_code, description, timestamp, unival, student_unival)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (student_unival)
        DO UPDATE SET
          phone = EXCLUDED.phone,
          message_id = EXCLUDED.message_id,
          response_code = EXCLUDED.response_code,
          description = EXCLUDED.description,
          timestamp = EXCLUDED.timestamp,
          unival = EXCLUDED.unival`,
        [
          clientsmsid,
          mobile,
          messageId || Math.random().toString(36).slice(2),
          responseCode,
          description,
          timestamp,
          unival,
          student_unival,
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error storing SMS results in database:", error);
    throw error;
  } finally {
    client.release();
  }
};

const processBatches = async (smslist, unival) => {
  const results = [];
  const batchCount = Math.ceil(smslist.length / BATCH_SIZE);

  for (let i = 0; i < batchCount; i++) {
    const batchStart = i * BATCH_SIZE;
    const batchEnd = batchStart + BATCH_SIZE;
    const batch = smslist.slice(batchStart, batchEnd);

    // Prepare bulk payload for this batch
    const payload = {
      count: batch.length,
      smslist: batch.map((sms) => ({
        partnerID: process.env.TEXTSMS_PARTNER_ID || sms.partnerID,
        apikey: process.env.TEXTSMS_API_KEY,
        pass_type: sms.pass_type || "plain",
        clientsmsid: sms.clientsmsid || Date.now() + i,
        mobile: sms.mobile,
        message: sms.message,
        shortcode: process.env.TEXTSMS_SHORTCODE || sms.shortcode,
      })),
    };

    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error("Lost internet connection during batch processing");
      }

      const response = await axios.post(
        `${process.env.TEXT_SMS_API_BASE_URL}/sendbulk/`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 3000,
        }
      );

      // Process each response in the batch
      if (response.data && response.data.responses) {
        response.data.responses.forEach((resp, idx) => {
          if (resp && resp["response-code"] === 200) {
            results.push({
              mobile: batch[idx].mobile,
              clientsmsid: batch[idx].clientsmsid,
              success: true,
              responseCode: resp["response-code"],
              description: resp["response-description"],
              messageId: resp.messageid,
              networkid: resp.networkid,
              timestamp: new Date().toISOString(),
            });
          } else {
            results.push({
              mobile: batch[idx].mobile,
              clientsmsid: batch[idx].clientsmsid,
              success: false,
              error: resp?.["response-description"] || "Unknown error",
              responseCode: resp?.["response-code"],
              description: resp?.["response-description"],
              timestamp: new Date().toISOString(),
            });
          }
        });
      } else {
        // If response format is unexpected, mark all as failed
        batch.forEach((sms) => {
          results.push({
            mobile: sms.mobile,
            clientsmsid: sms.clientsmsid,
            success: false,
            error: "Invalid response format from SMS gateway",
            timestamp: new Date().toISOString(),
          });
        });
      }
    } catch (error) {
      // If entire batch fails, mark all as failed
      batch.forEach((sms) => {
        results.push({
          mobile: sms.mobile,
          clientsmsid: sms.clientsmsid,
          success: false,
          error: error.message,
          responseCode: error.response?.data?.["response-code"],
          description: error.response?.data?.["response-description"],
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Rate limiting between batches (except last batch)
    if (i < batchCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  return results;
};

const formatMobileNumber = (number) => {
  try {
    if (!number) return null;

    const cleaned = number.toString().replace(/\D/g, "");

    // Kenyan numbers (07... or 254...)
    if (cleaned.match(/^(0|254)/)) {
      if (cleaned.startsWith("0") && cleaned.length === 9) {
        return `254${cleaned.substring(1)}`;
      }
      if (cleaned.startsWith("254") && cleaned.length === 12) {
        return cleaned;
      }
    }

    return null;
  } catch (error) {
    throw new Error(`Number formatting error for ${number}:`, error);
    return null;
  }
};
