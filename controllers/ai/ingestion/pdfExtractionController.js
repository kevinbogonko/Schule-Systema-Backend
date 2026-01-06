import fs from "fs";
import path from "path";

// This only extracts text from pdf and displays text

export const extractPdfText = async (req, res, next) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Store the temp file path for cleanup
    tempFilePath = req.file.path;

    // Import PDFParse
    const { PDFParse } = await import("pdf-parse");

    const pdfBuffer = fs.readFileSync(tempFilePath);

    // Create an instance of PDFParse with the buffer
    const parser = new PDFParse({
      data: pdfBuffer,
    });

    // Use getText() method as shown in documentation
    const result = await parser.getText();
    const text = result.text;

    // Save extracted text into a .txt file
    const outputDir = path.join("extracted");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `${Date.now()}_output.txt`);
    fs.writeFileSync(outputFile, text);

    // Clean up the uploaded temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log(`Cleaned up temp file: ${tempFilePath}`);
    }

    return res.status(200).json({
      message: "PDF text extracted successfully",
      output_file: outputFile,
      text_preview: text.substring(0, 250) + "...",
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    // Clean up temp file even on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temp file on error: ${tempFilePath}`);
      } catch (unlinkError) {
        console.error("Failed to clean up temp file:", unlinkError);
      }
    }

    return res
      .status(500)
      .json({ error: "Failed to extract PDF text: " + error.message });
  }
};
