import express from "express";
import {
  uploadSingle
} from "../../../middlewares/uploadMiddleware.js";
// import { extractPdfText } from "../../../controllers/ai/ingestion/pdfExtractionController.js";
import { extractPdfText } from "../../../controllers/ai/ingestion/index.js";

const router = express.Router();

// router.post("/extract_pdf", uploadSingle, extractPdfText);
router.post("/extract_pdf", uploadSingle, extractPdfText);


export default router;