import { createError } from "../../../../utils/ErrorHandler.js";
import { processAndSaveImage } from "./fileUploader.js";
import { processAndSaveDocument } from "./fileUploader.js";
import { saveImageToDB } from "./DBHandler.js";
// import { saveDocumentToDB } from "./documentDBHandler.js"; // you need to implement this

// Upload single image
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No file uploaded");

    const folder = req.params.folder || "misc";
    const bodyData = req.body;

    const result = await processAndSaveImage(
      req.file,
      folder,
      bodyData,
      saveImageToDB
    );

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: { imageUrl: result.path },
    });
  } catch (err) {
    next(err);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw createError(400, "No files uploaded");
    }

    const folder = req.params.folder || "misc";
    const bodyData = req.body;
    const images = [];

    for (const file of req.files) {
      const data = await processAndSaveImage(
        file,
        folder,
        bodyData,
        saveImageToDB
      );
      images.push(data.path);
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: { imageUrls: images },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   DOCUMENT UPLOAD LOGIC
   ============================================================ */

// Upload single document
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No document uploaded");

    const folder = req.params.folder || "docs";
    const bodyData = req.body;

    const result = await processAndSaveDocument(
      req.file,
      folder,
      bodyData,
      // saveDocumentToDB
    );

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: { documentUrl: result.path },
    });
  } catch (err) {
    next(err);
  }
};

// Upload multiple documents
export const uploadMultipleDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw createError(400, "No documents uploaded");
    }

    const folder = req.params.folder || "docs";
    const bodyData = req.body;
    const documents = [];

    for (const file of req.files) {
      const data = await processAndSaveDocument(
        file,
        folder,
        bodyData,
        // saveDocumentToDB
      );
      documents.push(data.path);
    }

    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: { documentUrls: documents },
    });
  } catch (err) {
    next(err);
  }
};
