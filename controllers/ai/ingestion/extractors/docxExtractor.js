import fs from "fs";
import mammoth from "mammoth";

export const extractDOCX = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value };
};
