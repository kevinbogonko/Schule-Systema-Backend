import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
} from "../../../controllers/analytics/upload/images/uploadController.js";
import { uploadMultiple, uploadSingle } from "../../../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/upload/:folder", uploadSingle, uploadImage);
router.post("/uploads/:folder", uploadMultiple, uploadMultipleImages);


export default router;
