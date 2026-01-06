import express from 'express'
import {
  gradingScale,
  updateGrading,
  allGradingScales,
} from "../../../controllers/analytics/exams/gradingController.js";

// Initialising Router Instance
const router = express.Router()

//
router.post("/gradingscale", gradingScale)
router.post("/gradingscales", allGradingScales)
router.put("/updategrading", updateGrading)


export default router