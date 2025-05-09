import express from 'express'
import { sendBulkSMS } from '../controllers/sms/standardSMSController.js'
// import { verifyToken } from '../utils/verifyToken.js'

const router = express.Router()

router.post("/bulk", sendBulkSMS)

export default router