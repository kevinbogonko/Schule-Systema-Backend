import express from 'express'
import { formattedStudResult } from "../../controllers/examResultSMS.js";
import { studentResultsPrep } from "../../controllers/sms/results/smsResultsPrepController.js";
import {sendStudentResultsSMS } from "../../controllers/sms/results/sendResultSMSController.js"
import { getSMSResultLogs } from "../../controllers/sms/logs/smsLogsController.js";
import { sendCOSMS } from "../../controllers/sms/co/sendCOSMSController.js";


const router = express.Router()

router.post("/smsres", formattedStudResult) // For Setting Result SMS Parameters

router.post("/smsre", studentResultsPrep);

router.post("/sendresultsms", sendStudentResultsSMS); // For sending Student Results SMS

// CO SMS
router.post("/sendcosms", sendCOSMS); // Send CO SMS Messages

// SMS LOGS

router.post("/getsmslogs", getSMSResultLogs);


export default router