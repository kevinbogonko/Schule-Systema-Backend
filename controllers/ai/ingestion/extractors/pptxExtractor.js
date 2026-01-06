import parse from "pptx-parser";

export const extractPPTX = async (filePath) => {
  const parsed = await parse(filePath);
  const slides = parsed.slides.map((slide) => ({
    text: slide.text,
    images: slide.images?.map((img) => img.data) || [],
  }));
  return { slides };
};
