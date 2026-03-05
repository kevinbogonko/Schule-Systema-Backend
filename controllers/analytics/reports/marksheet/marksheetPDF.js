import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateMarksheetPDF = async (response, callback = () => {}) => {
  try {
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 20,
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      if (typeof callback === "function") {
        callback(null, pdfData);
      }
    });

    // Calculate how many students fit per page
    const studentsPerPage = Math.floor((doc.page.height - 200) / 20);

    let logoPath = response.schoolDetails.logoPath
      ? path.join(__dirname, response.schoolDetails.logoPath)
      : "";

    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(
        __dirname,
        "../../../../public/images/defaults/logo.jpeg",
      );
      if (!fs.existsSync(logoPath)) {
        logoPath = null;
      }
    }

    // Function to add header to each page
    const addHeader = async () => {
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

          const system844 = [19, 20, 21, 22];
          const nonCBCFormMap = {
            19: 1,
            20: 2,
            21: 3,
            22: 4,
          };

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
        // .text(`MARKSHEET - ${response.schoolDetails.exam}`, 20, y, {
        .text(
          `MARKSHEET - ${response?.exam} TERM ${response?.term} ${
            system844.includes(Number(response?.form)) ? "FORM" : "GRADE"
          } ${system844.includes(Number(response?.form)) ? nonCBCFormMap[response?.form] : response?.form} - ${response?.year}`,
          20,
          y,
          {
            align: "center",
            width: backgroundWidth,
          },
        );
      doc.moveDown(0.5);
    };

    // Function to add table to each page
    const addTable = (students, startIndex) => {
      const pageWidth = doc.page.width;
      const tableTop = 115;
      const tableLeft = 20;
      const rowHeight = 20;
      const snColWidth = 30;
      const admColWidth = 50;
      const nameColWidth = 120;
      const headers = ["S/N", "Adm. No", "Name", ...response.subjectHeaders];
      const remainingWidth =
        pageWidth - 40 - snColWidth - admColWidth - nameColWidth;
      const subjectColWidth = remainingWidth / response.subjectHeaders.length;

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
        doc.rect(x, tableTop, width, rowHeight).fill("#bfdbfe");
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

      students.forEach((student, rowIndex) => {
        const y = tableTop + (rowIndex + 1) * rowHeight;
        let x = tableLeft;

        doc
          .moveTo(x, y)
          .lineTo(x + pageWidth - 40, y)
          .stroke();

        if (rowIndex % 2 === 0) {
          doc.rect(x, y, pageWidth - 40, rowHeight).fill("#f3f4f6");
        }

        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
        doc
          .fillColor("black")
          .text((startIndex + rowIndex + 1).toString(), x + 5, y + 5, {
            width: snColWidth - 10,
            align: "left",
          });
        x += snColWidth;

        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
        doc.text(student.admNo.toString(), x + 5, y + 5, {
          width: admColWidth - 10,
          align: "left",
        });
        x += admColWidth;

        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
        doc.text(student.name, x + 5, y + 5, {
          width: nameColWidth - 10,
          align: "left",
        });
        x += nameColWidth;

        response.subjectHeaders.forEach((subject) => {
          doc
            .moveTo(x, y)
            .lineTo(x, y + rowHeight)
            .stroke();
          if (student[subject] !== undefined && student[subject] !== "") {
            doc.text(student[subject].toString(), x + 5, y + 5, {
              width: subjectColWidth - 10,
              align: "center",
            });
          }
          x += subjectColWidth;
        });

        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
      });

      const lastRowY = tableTop + (students.length + 1) * rowHeight;
      doc
        .moveTo(tableLeft, lastRowY)
        .lineTo(tableLeft + pageWidth - 40, lastRowY)
        .stroke();
    };

    // Process students in chunks per page
    let studentRows = response.studentData || [];

    // Sort students by admission number (assuming this is the student ID)
    // Modify this based on what property contains the actual ID
    studentRows = [...studentRows].sort((a, b) => {
      // If you have a specific ID field like 'id' or 'studentId'
      // Replace 'admNo' with the actual ID field name
      const idA = parseInt(a.admNo) || a.admNo;
      const idB = parseInt(b.admNo) || b.admNo;

      if (typeof idA === "number" && typeof idB === "number") {
        return idA - idB;
      }
      return String(idA).localeCompare(String(idB));
    });

    // Add header to first page
    await addHeader();

    for (let i = 0; i < studentRows.length; i += studentsPerPage) {
      if (i > 0) {
        doc.addPage();
        await addHeader();
      }

      const chunk = studentRows.slice(i, i + studentsPerPage);
      addTable(chunk, i);
    }

    doc.end();
  } catch (error) {
    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("PDF generation error:", error);
    }
  }
};
