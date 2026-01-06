import Tesseract from "tesseract.js";

export const runOCR = async (imagePath) => {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng", {
    logger: (m) => console.log(m),
  });
  return text;
};
