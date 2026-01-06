import ExcelJS from "exceljs";

export const extractXLSX = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheets = [];

  workbook.eachSheet((sheet) => {
    const data = [];
    sheet.eachRow((row) => {
      data.push(row.values.slice(1)); // skip first undefined index
    });
    sheets.push({ sheetName: sheet.name, data });
  });

  return { sheets };
};
