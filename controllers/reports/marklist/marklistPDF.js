import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateMarklistPDF = async (response, callback = () => {}) => {
  try {
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 20,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      if (typeof callback === "function") {
        callback(null, pdfData);
      }
    });

    let totalPages = 1;
    doc.on("pageAdded", () => {
      totalPages++;
    });

    const addPageNumbers = () => {
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(10)
          .text(
            `Page ${i + 1} of ${totalPages}`,
            doc.page.width - 100,
            doc.page.height - 20,
            {
              align: "center",
              width: 100,
            }
          );
      }
    };

    let logoPath = response.schoolDetails.logoPath
      ? path.join(__dirname, response.schoolDetails.logoPath)
      : "";

    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(
        __dirname,
        "../../../public/images/defaults/logo.jpeg"
      );
      if (!fs.existsSync(logoPath)) {
        logoPath = null;
      }
    }

    if (logoPath) {
      try {
        let imageBuffer;
        if (logoPath.endsWith(".webp")) {
          imageBuffer = await sharp(logoPath).toFormat("png").toBuffer();
        } else {
          imageBuffer = fs.readFileSync(logoPath);
        }

        doc.image(imageBuffer, 20, 20, {
          height: 50,
          fit: [50, 50],
        });
      } catch (err) {
        console.error("Error loading logo:", err);
      }
    }

    doc
      .font("Times-Bold")
      .fontSize(12)
      .text(response.schoolDetails.schoolname || "", { align: "right" });
    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails.motto || "", { align: "right" });
    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails.address || "", { align: "right" });
    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails.phone || "", { align: "right" });
    doc.moveDown(1);

    const pageWidth = doc.page.width;
    const backgroundWidth = pageWidth - 40;
    const y = 85;
    const titleBgColor = "#bfdbfe";

    doc.rect(20, y - 5, backgroundWidth, 20).fill(titleBgColor);
    doc
      .fillColor("black")
      .font("Times-Bold")
      .fontSize(12)
      .text(`MARKSHEET - ${response.schoolDetails.exam || ""}`, 20, y, {
        align: "center",
        width: backgroundWidth,
      });
    doc.moveDown(0.5);

    const tableTop = y + 30;
    const tableLeft = 20;
    const rowHeight = 20;
    const snColWidth = 30;
    const admColWidth = 50;
    const nameColWidth = 120;
    const headers = [
      "S/N",
      "Adm. No",
      "Name",
      ...(response.subjectHeaders || []),
    ];
    const remainingWidth =
      pageWidth - 40 - snColWidth - admColWidth - nameColWidth;
    const subjectColWidth = response.subjectHeaders?.length
      ? remainingWidth / response.subjectHeaders.length
      : 0;

    doc.strokeColor("#808080");
    doc.font("Times-Bold").fontSize(10);

    let x = tableLeft;

    doc
      .moveTo(x, tableTop)
      .lineTo(x + pageWidth - 40, tableTop)
      .stroke();

    headers.forEach((header, i) => {
      let width =
        i === 0
          ? snColWidth
          : i === 1
          ? admColWidth
          : i === 2
          ? nameColWidth
          : subjectColWidth;

      doc
        .moveTo(x, tableTop)
        .lineTo(x, tableTop + rowHeight)
        .stroke();
      doc.rect(x, tableTop, width, rowHeight).fill(titleBgColor);
      doc.fillColor("black").text(header, x + 5, tableTop + 5, {
        width: width - 10,
        align: i >= 3 ? "center" : "left",
      });
      x += width;
    });

    doc
      .moveTo(x, tableTop)
      .lineTo(x, tableTop + rowHeight)
      .stroke();
    doc
      .moveTo(tableLeft, tableTop + rowHeight)
      .lineTo(x, tableTop + rowHeight)
      .stroke();

    doc.font("Times-Roman").fontSize(10);

    const studentRows = response.formattedStudents || [];
    studentRows.forEach((student, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      let x = tableLeft;

      doc
        .moveTo(x, y)
        .lineTo(x + pageWidth - 40, y)
        .stroke();

      if (rowIndex % 2 === 0) {
        doc.rect(x, y, pageWidth - 40, rowHeight).fill("#f3f4f6");
      }

      // S/N
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.fillColor("black").text(student.sn?.toString() || "", x + 5, y + 5, {
        width: snColWidth - 10,
        align: "left",
      });
      x += snColWidth;

      // Adm No
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.text(student.id?.toString() || "", x + 5, y + 5, {
        width: admColWidth - 10,
        align: "left",
      });
      x += admColWidth;

      // Name
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.text(student.name || "", x + 5, y + 5, {
        width: nameColWidth - 10,
        align: "left",
      });
      x += nameColWidth;

      // Subjects and other columns
      response.subjectHeaders.forEach((header) => {
        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();

        let value = "";
        if (header === "Mrks") {
          value = student.marks?.toString() || "";
        } else if (header === "Pts") {
          value = student.points?.toString() || "";
        } else if (header === "Grd") {
          value = student.grade?.toString() || "";
        } else if (header === "S.Rk") {
          value = student.stream_rank?.toString() || "";
        } else if (header === "O.Rk") {
          value = student.overal_rank?.toString() || "";
        } else {
          // It's a subject
          value = student.subjects?.[header]?.toString() || "";
        }

        doc.text(value, x + 5, y + 5, {
          width: subjectColWidth - 10,
          align: "center",
        });
        x += subjectColWidth;
      });

      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
    });

    const lastRowY = tableTop + (studentRows.length + 1) * rowHeight;
    doc
      .moveTo(tableLeft, lastRowY)
      .lineTo(tableLeft + pageWidth - 40, lastRowY)
      .stroke();

    addPageNumbers();

    doc.end();
  } catch (error) {
    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("PDF generation error:", error);
    }
  }
};
