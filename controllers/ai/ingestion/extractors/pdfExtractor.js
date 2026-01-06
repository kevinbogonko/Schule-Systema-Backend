import fs from "fs";
// import pdf from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import { runOCR } from "../utils/ocr.js";

export const extractPDF = async (filePath) => {

  const { PDFParse } = await import("pdf-parse");

  // const pdfBuffer = fs.readFileSync(filePath);

  const dataBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: dataBuffer,
  });


  // Extract text
  // const textData = await pdf(dataBuffer);
  const result = await parser.getText();
  const textData = result.text;

  // Extract images
  const pdfDoc = await PDFDocument.load(dataBuffer);
  const pages = pdfDoc.getPages();
  const images = [];

  for (const [i, page] of pages.entries()) {
    const xObjects = page.node.Resources?.XObject || {};
    for (const key in xObjects) {
      const xObj = xObjects[key];
      if (xObj?.embedder) {
        const imgBytes = xObj.embedder.embedBytes;
        images.push({ page: i + 1, data: imgBytes.toString("base64") });
      }
    }
  }

  // Optional: OCR for formulas or scanned content
  // Convert page to image externally if needed, then runOCR(pageImagePath)

  return { text: textData.text, images };
};
