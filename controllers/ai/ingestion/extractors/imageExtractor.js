import { runOCR } from "../utils/ocr.js";

export const extractImage = async (filePath) => {
  const text = await runOCR(filePath);
  return { text };
};
