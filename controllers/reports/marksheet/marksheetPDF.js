import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Convert ES module URL to dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateMarksheetPDF = async (response, callback = () => {}) => {
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
      } else {
        console.error("Callback is not a function");
      }
    });

    // Track total pages
    let totalPages = 1;

    // Add footer to each page
    doc.on("pageAdded", () => {
      totalPages++;
    });

    // Function to add page numbers
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
            { align: "center", width: 100 }
          );
      }
    };

    // Handle logo path
    let logoPath = response.schoolDetails.logoPath
      ? path.join(__dirname, response.schoolDetails.logoPath)
      : "";

    if (!fs.existsSync(logoPath)) {
      console.warn("Custom logo not found. Using default.");
      logoPath = path.join(
        __dirname,
        "../../../public/images/defaults/logo.jpeg"
      );
      if (!fs.existsSync(logoPath)) {
        console.warn("Default logo not found. Skipping logo.");
        logoPath = null;
      }
    }

    // Header Section with Logo
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
      } catch (imageError) {
        console.error("Error loading logo image:", imageError);
      }
    }

    // School details text
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

    // Main title section
    const pageWidth = doc.page.width;
    const backgroundWidth = pageWidth - 40;
    const y = 85;

    const titleBgColor = "#bfdbfe";
    doc.rect(20, y - 5, backgroundWidth, 20).fill(titleBgColor);
    doc
      .fillColor("black")
      .font("Times-Bold")
      .fontSize(12)
      .text(`MARKSHEET - ${response.schoolDetails.exam}`, { align: "center" });
    doc.moveDown(0.5);

    // Table setup
    const tableTop = y + 30;
    const tableLeft = 20;
    const rowHeight = 20;
    const snColWidth = 30;
    const admColWidth = 50;
    const nameColWidth = 120;
    const remainingWidth =
      pageWidth - 40 - snColWidth - admColWidth - nameColWidth;
    const subjectColWidth = remainingWidth / response.subjectHeaders.length;
    const headers = ["S/N", "Adm. No", "Name", ...response.subjectHeaders];

    // Set gray color for all grid lines
    doc.strokeColor("#808080");

    // Draw header row
    doc.font("Times-Bold").fontSize(10);
    let x = tableLeft;

    // Draw top border
    doc
      .moveTo(x, tableTop)
      .lineTo(x + pageWidth - 40, tableTop)
      .stroke();

    headers.forEach((header, i) => {
      let width;
      if (i === 0) width = snColWidth;
      else if (i === 1) width = admColWidth;
      else if (i === 2) width = nameColWidth;
      else width = subjectColWidth;

      // Draw vertical line
      doc
        .moveTo(x, tableTop)
        .lineTo(x, tableTop + rowHeight)
        .stroke();

      // Header background same as title
      doc.rect(x, tableTop, width, rowHeight).fill(titleBgColor);

      // Header text in black
      doc.fillColor("black").text(header, x + 5, tableTop + 5, {
        width: width - 10,
        align: i >= 3 ? "center" : "left",
      });
      x += width;
    });

    // Draw right border and bottom border for header
    doc
      .moveTo(x, tableTop)
      .lineTo(x, tableTop + rowHeight)
      .stroke();
    doc
      .moveTo(tableLeft, tableTop + rowHeight)
      .lineTo(x, tableTop + rowHeight)
      .stroke();

    // Draw student rows
    doc.font("Times-Roman").fontSize(10);
    response.studentData.forEach((student, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      let x = tableLeft;

      // Draw horizontal line
      doc
        .moveTo(x, y)
        .lineTo(x + pageWidth - 40, y)
        .stroke();

      // Alternate row coloring
      if (rowIndex % 2 === 0) {
        doc.rect(x, y, pageWidth - 40, rowHeight).fill("#f3f4f6");
      }

      // S/N column
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.fillColor("black").text(student.sn.toString(), x + 5, y + 5, {
        width: snColWidth - 10,
        align: "left",
      });
      x += snColWidth;

      // Adm No column
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.text(student.admNo.toString(), x + 5, y + 5, {
        width: admColWidth - 10,
        align: "left",
      });
      x += admColWidth;

      // Name column
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
      doc.text(student.name, x + 5, y + 5, {
        width: nameColWidth - 10,
        align: "left",
      });
      x += nameColWidth;

      // Subject columns
      response.subjectHeaders.forEach((subject) => {
        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
        // Only display if value exists (no "-")
        if (student[subject] !== undefined && student[subject] !== "") {
          doc.text(student[subject].toString(), x + 5, y + 5, {
            width: subjectColWidth - 10,
            align: "center",
          });
        }
        x += subjectColWidth;
      });

      // Right border
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
    });

    // Bottom border
    const lastRowY = tableTop + (response.studentData.length + 1) * rowHeight;
    doc
      .moveTo(tableLeft, lastRowY)
      .lineTo(tableLeft + pageWidth - 40, lastRowY)
      .stroke();

    // Add footer to first page
    // addFooter();

    // Add page numbers after all content is generated
    addPageNumbers();

    doc.end();
  } catch (error) {
    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("Unhandled PDF generation error:", error);
    }
  }
};