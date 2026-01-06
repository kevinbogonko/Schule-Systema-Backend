import express from 'express'
import { formattedStudResult } from "../../../controllers/analytics/examResultSMS.js";
import { studentResultsPrep } from "../../../controllers/analytics/sms/results/smsResultsPrepController.js";
import { sendStudentResultsSMS } from "../../../controllers/analytics/sms/results/sendResultSMSController.js";
import { getSMSResultLogs } from "../../../controllers/analytics/sms/logs/smsLogsController.js";
import { sendCOSMS } from "../../../controllers/analytics/sms/co/sendCOSMSController.js";
import { sendGenericCOSMS } from "../../../controllers/analytics/sms/generic/sendGenericSMS.js";


const router = express.Router()

router.post("/smsres", formattedStudResult) // For Setting Result SMS Parameters

router.post("/smsre", studentResultsPrep);

router.post("/sendresultsms", sendStudentResultsSMS); // For sending Student Results SMS

// CO SMS
router.post("/sendcosms", sendCOSMS); // Send CO SMS Messages

// GENERIC SMS
router.post("/sendgensms", sendGenericCOSMS); // Send Generic SMS Messages

// SMS LOGS

router.post("/getsmslogs", getSMSResultLogs);


export default router