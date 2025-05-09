import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileFilter } from "../utils/fileFilter.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const multerConfig = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
};

// 1. For single file upload (field name: "image")
export const uploadSingle = multer(multerConfig).single("image");

// 2. For multiple files (field name: "images", max 5 files)
export const uploadMultiple = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 5, // Max 5 files
  },
}).array("images", 5); // "images" field, max 5 files

// 3. For mixed fields (e.g., avatar + gallery)
export const uploadMixed = multer(multerConfig).fields([
  { name: "avatar", maxCount: 1 }, // Field name: "avatar" (1 file)
  { name: "gallery", maxCount: 3 }, // Field name: "gallery" (up to 3 files)
]);

// Default export (backward compatibility)
export default uploadSingle;
