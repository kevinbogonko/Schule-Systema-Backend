import { createError } from "../../../utils/ErrorHandler.js";
import { processAndSaveImage } from "./imageUploader.js";
import { saveImageToDB } from "./imageDBHandler.js";

// Upload single image
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No file uploaded");

    const folder = req.params.folder || "misc";
    const bodyData = req.body
    // console.log(form, year, id);
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
      const data = await processAndSaveImage(file, folder, bodyData, saveImageToDB);
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
