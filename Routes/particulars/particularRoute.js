
import express from 'express'
import {
  getParticulars,
  updateParticulars,
} from "../../controllers/particulars/particularController.js";

const router = express.Router()

// Endpoint to get particulars
router.get("/getparticulars", getParticulars);

// Endpoint to update particulars
router.post("/updateparticulars", updateParticulars);

export default router

