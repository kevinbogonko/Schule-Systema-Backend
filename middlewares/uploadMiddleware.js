import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileFilter } from "../utils/fileFilter.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine upload folder depending on file type
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    // Documents folder
    const documentExts = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ];

    if (documentExts.includes(ext)) {
      return cb(null, path.join(__dirname, "../public/documents"));
    }

    // Default: Images folder
    return cb(null, path.join(__dirname, "../public/images"));
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Custom file size handler depending on file type
const fileSizeLimit = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const documentExts = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
  ];

  // Documents get 10MB
  if (documentExts.includes(ext)) {
    req.fileSizeLimit = 10 * 1024 * 1024;
  } else {
    // Images stay 5MB
    req.fileSizeLimit = 5 * 1024 * 1024;
  }

  cb(null, true);
};

const multerConfig = {
  storage: storage,
  fileFilter: (req, file, cb) => {
    fileSizeLimit(req, file, () => {});
    fileFilter(req, file, cb);
  },
  limits: {
    fileSize: (req, file) => req?.fileSizeLimit || 5 * 1024 * 1024,
  },
};

// 1. Single file upload
export const uploadSingle = multer(multerConfig).single("file");

// 2. Multiple files upload (max 5)
export const uploadMultiple = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 5,
  },
}).array("files", 5);

// 3. Mixed uploads (avatar + gallery)
export const uploadMixed = multer(multerConfig).fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 3 },
]);

export default uploadSingle;
