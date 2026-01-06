import { detectFileType } from "./utils/fileType.js";
import { extractPDF } from "./extractors/pdfExtractor.js";
import { extractDOCX } from "./extractors/docxExtractor.js";
import { extractXLSX } from "./extractors/xlsxExtractor.js";
// import { extractPPTX } from "./extractors/pptxExtractor.js";
import { extractImage } from "./extractors/imageExtractor.js";

export const extractContent = async (filePath) => {
  const type = await detectFileType(filePath);

  switch (type) {
    case "pdf":
      return extractPDF(filePath);
    case "docx":
      return extractDOCX(filePath);
    case "xlsx":
      return extractXLSX(filePath);
    // case "pptx":
    //   return extractPPTX(filePath);
    case "png":
    case "jpg":
    case "jpeg":
      return extractImage(filePath);
    default:
      throw new Error("Unsupported file type: " + type);
  }
};
