import express from 'express'
import {
  getSystemLevels,
  updateSystemLevels,
} from "../controllers/systemLevelController.js";

const router = express.Router()

// Endpoint to get particulars
router.get("/getlevels", getSystemLevels);

// Endpoint to update particulars
router.post("/updatelevels", updateSystemLevels);

export default router