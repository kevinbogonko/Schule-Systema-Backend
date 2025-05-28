import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
} from "../../controllers/upload/images/uploadController.js";
import { uploadMultiple, uploadSingle } from "../../config/uploadMiddleware.js";

const router = express.Router();

router.post("/upload/:folder", uploadSingle, uploadImage);
router.post("/uploads/:folder", uploadMultiple, uploadMultipleImages);


export default router;
