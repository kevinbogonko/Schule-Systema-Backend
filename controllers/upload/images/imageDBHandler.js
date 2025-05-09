import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";

// Sanitize helper
const isValidString = (value) =>
  typeof value === "string" && value.trim() !== "";
const isValidNumber = (value) => Number.isInteger(value) && value > 0;

export const saveImageToDB = async ({
  filename,
  path,
  folder,
  bodyData,
  file_hash,
  uploaded_at,
}) => {
  // Validate common inputs
  if (
    !isValidString(filename) ||
    !isValidString(path) ||
    !isValidString(folder) ||
    !isValidString(file_hash)
  ) {
    throw createError(400, "Invalid input data.");
  }

  try {
    if (folder === "student_photo") {
      const { form, year, id } = bodyData;

      if (!isValidString(form) || !isValidString(year) || !isValidString(id)) {
        throw createError(400, "Missing student data.");
      }

      const imagesTable = `student_form_${form}_images`;
      const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(imagesTable);
      if (!validTableName) {
        throw createError(400, "Invalid table name constructed from form.");
      }

      // Check for duplicate file hash
      const existing = await pool.query(
        `SELECT 1 FROM ${imagesTable} WHERE file_hash = $1 LIMIT 1`,
        [file_hash]
      );

      if (existing.rows.length > 0) {
        throw createError(409, "Duplicate file detected. Upload aborted.");
      }

      // Insert or update student image
      await pool.query(
        `
        INSERT INTO ${imagesTable} (id, year, filename, path, folder, file_hash, uploaded_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          year = EXCLUDED.year,
          filename = EXCLUDED.filename,
          path = EXCLUDED.path,
          folder = EXCLUDED.folder,
          file_hash = EXCLUDED.file_hash,
          uploaded_at = EXCLUDED.uploaded_at
        `,
        [id, year, filename, path, folder, file_hash, uploaded_at]
      );
    } else if (folder === "teacher_photo") {
      const { id } = bodyData;

      if (!isValidString(id)) {
        throw createError(400, "Missing teacher ID.");
      }

      // Check for duplicate file hash
      const existing = await pool.query(
        `SELECT 1 FROM staff_images WHERE file_hash = $1 LIMIT 1`,
        [file_hash]
      );

      if (existing.rows.length > 0) {
        throw createError(409, "Duplicate file detected. Upload aborted.");
      }
      
      // Add staff Images 
      await pool.query(
        `
        INSERT INTO staff_images (id, filename, path, folder, file_hash, uploaded_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          filename = EXCLUDED.filename,
          path = EXCLUDED.path,
          folder = EXCLUDED.folder,
          file_hash = EXCLUDED.file_hash,
          uploaded_at = EXCLUDED.uploaded_at
        `,
        [id, filename, path, folder, file_hash, uploaded_at]
      );
    } else if (folder === "school_logo") {
      // Check for duplicate file hash
      const existing = await pool.query(
        `SELECT 1 FROM particulars WHERE file_hash = $1 LIMIT 1`,
        [file_hash]
      );

      if (existing.rows.length > 0) {
        throw createError(409, "Duplicate file detected. Upload aborted.");
      }

      // Insert or update school logo image
      await pool.query(
        `
        UPDATE particulars SET logo_path = $1, file_hash = $2 WHERE id = $3
        `,
        [path, file_hash, 119]
      );

    } else {
      throw createError(400, "Unsupported folder type.");
    }
  } catch (err) {
    throw createError(500, "Database error: " + err.message);
  }
};
