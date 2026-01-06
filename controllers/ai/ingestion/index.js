// import path from "path";
import { extractContent } from "./aggregator.js";

// const filePath = "./files/sample.pdf";

// extractContent(filePath)
//   .then((data) => {
//     console.log("Extracted content:", JSON.stringify(data, null, 2));
//   })
//   .catch((err) => console.error(err));

export const extractPdfText = async (req, res, next) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Store the temp file path for cleanup
    tempFilePath = req.file.path;

    extractContent(tempFilePath)
      .then((data) => {
        console.log("Extracted content:", JSON.stringify(data, null, 2));
      })
      .catch((err) => console.error(err));

  } catch (error) {
    console.log(error)
    next(error)
  }
};
