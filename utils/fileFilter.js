const imageMimes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const documentMimes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

export const fileFilter = (req, file, cb) => {
  if (
    imageMimes.includes(file.mimetype) ||
    documentMimes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};
