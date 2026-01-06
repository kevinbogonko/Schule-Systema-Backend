import multer from "multer";

export const uploadExcel = multer({
  storage: multer.memoryStorage(), // Use memory storage for Excel files
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept Excel files
    if (
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.originalname.match(/\.(xlsx|xls|csv)$/)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
}).single("excelFile");
