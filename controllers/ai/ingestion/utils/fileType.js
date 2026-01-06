import {fileTypeFromBuffer} from "file-type";
import fs from "fs";

export const detectFileType = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const type = await fileTypeFromBuffer(buffer);
  return type ? type.ext : "unknown";
};
