import { createError } from "../../utils/ErrorHandler.js";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import db from "../../config/db_connection.js"; // adjust path as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Wait helper
const wait = (ms, reason = "") =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Safe delete
const safeUnlink = async (filePath, retries = 5, initialDelay = 300) => {
  if (typeof filePath !== "string" || !filePath.trim()) return false;

  let delay = initialDelay;
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      lastError = error;
      if (
        attempt === retries ||
        !["EPERM", "EACCES", "EBUSY", "ENOENT"].includes(error.code)
      ) {
        return false;
      }
      await wait(
        process.platform === "win32" ? 1000 : delay,
        `retry ${attempt}`
      );
      delay *= 2;
    }
  }
  return false;
};

// Main image processing function
const processAndSaveImage = async (file, folder = "misc") => {
  if (!file || !file.path) {
    throw createError(400, "Invalid file object - missing path");
  }

  const publicDir = path.resolve("public/images", folder);
  await fs.mkdir(publicDir, { recursive: true });

  const originalPath = path.resolve(file.path);
  const buffer = await fs.readFile(originalPath);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Check for duplicate by file content hash
  const existing = await db.query(
    `SELECT * FROM uploaded_images WHERE file_hash = $1 LIMIT 1`,
    [hash]
  );
  if (existing.rows.length > 0) {
    await safeUnlink(originalPath);
    throw createError(409, "Duplicate file detected. Upload aborted.");
  }

  const filename = `image-${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}.webp`;
  const outputPath = path.join(publicDir, filename);
  const relativePath = `/images/${folder}/${filename}`;

  try {
    await sharp(buffer)
      .resize(1200, 800, { fit: "inside", withoutEnlargement: true })
      .toFormat("webp", { quality: 80 })
      .toFile(outputPath);

    await safeUnlink(originalPath);

    // Save upload metadata to DB
    await db.query(
      `INSERT INTO uploaded_images (filename, path, folder, file_hash, uploaded_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [filename, relativePath, folder, hash]
    );

    return relativePath;
  } catch (err) {
    await safeUnlink(outputPath);
    throw createError(500, `Image processing failed: ${err.message}`);
  }
};

// Controller for single image
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, "No file uploaded");
    }

    const folder = req.params.folder || "misc";
    const imagePath = await processAndSaveImage(req.file, folder);

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: { imageUrl: imagePath },
    });
  } catch (err) {
    next(err);
  }
};

// Controller for multiple images
export const uploadMultipleImages = async (req, res, next) => {
  try {
    const files = req.files;
    const folder = req.params.folder || "misc";

    if (!files || files.length === 0) {
      throw createError(400, "No files uploaded");
    }

    const imagePaths = await Promise.all(
      files.map((file) => processAndSaveImage(file, folder))
    );

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: { imageUrls: imagePaths },
    });
  } catch (err) {
    next(err);
  }
};
