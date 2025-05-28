// imageUploader.js
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { createError } from "../../../utils/ErrorHandler.js";
import pool from "../../../config/db_connection.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeUnlink = async (filePath, retries = 5, initialDelay = 300) => {
  if (!filePath || typeof filePath !== "string") return false;
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return true;
    } catch (err) {
      if (
        attempt === retries ||
        !["EPERM", "EACCES", "EBUSY", "ENOENT"].includes(err.code)
      ) {
        return false;
      }
      await wait(process.platform === "win32" ? 1000 : delay);
      delay *= 2;
    }
  }
  return false;
};

const deleteExistingImage = async (folder, bodyData, publicDir) => {
  try {
    let existingFilename = null;

    if (folder === "student_photo") {
      const { form, id } = bodyData;
      if (!form || !id) return;

      const result = await pool.query(
        `SELECT filename FROM student_images WHERE id = $1`,
        [id]
      );
      existingFilename = result.rows[0]?.filename;
    } else if (folder === "teacher_photo") {
      const { id } = bodyData;
      if (!id) return;

      const result = await pool.query(
        `SELECT filename FROM staff_images WHERE id = $1`,
        [id]
      );
      existingFilename = result.rows[0]?.filename;
    } else if (folder === "school_logo") {
      const result = await pool.query(
        `SELECT logo_path FROM particulars WHERE id = 119`
      );
      const logoPath = result.rows[0]?.logo_path;
      if (logoPath) {
        existingFilename = logoPath.split("/").pop();
      }
    }

    if (existingFilename) {
      const existingPath = path.join(publicDir, existingFilename);
      await safeUnlink(existingPath);
      console.log(`Deleted existing image: ${existingPath}`);
    }
  } catch (error) {
    console.error("Error deleting existing image:", error);
  }
};

export const processAndSaveImage = async (
  file,
  folder = "misc",
  bodyData,
  onSuccess = null
) => {
  if (!file || !file.path) {
    throw createError(400, "Invalid file object - missing path");
  }

  const publicDir = path.resolve("public/images", folder);
  await fs.mkdir(publicDir, { recursive: true });

  // Delete existing image before processing new one
  await deleteExistingImage(folder, bodyData, publicDir);

  const originalPath = path.resolve(file.path);
  const buffer = await fs.readFile(originalPath);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

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

    const data = {
      filename,
      path: relativePath,
      folder,
      bodyData,
      file_hash: hash,
      uploaded_at: new Date(),
    };

    if (typeof onSuccess === "function") {
      await onSuccess(data);
    }

    return data;
  } catch (err) {
    await safeUnlink(outputPath);
    throw createError(500, `Image processing failed: ${err.message}`);
  }
};
