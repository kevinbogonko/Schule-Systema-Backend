import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateMarkAnalysisPDF = async (
  response,
  callback = () => {}
) => {
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

    let totalPages = 1;
    doc.on("pageAdded", () => {
      totalPages++;
    });

    const addPageNumbers = () => {
      const pages = doc.bufferedPageRange();
      if (pages.count === 0) return;

      for (let i = 0; i < pages.count; i++) {
        const pageNumber = pages.start + i;
        doc.switchToPage(pageNumber);
        doc
          .fontSize(10)
          .text(
            `Page ${pageNumber + 1} of ${totalPages}`,
            doc.page.width - 100,
            doc.page.height - 20,
            { align: "center", width: 100 }
          );
      }
    };

    let logoPath = response.schoolDetails.logoPath
      ? path.join(__dirname, response.schoolDetails.logoPath)
      : "";

    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(
        __dirname,
        "../../../../public/images/defaults/logo.jpeg"
      );
      if (!fs.existsSync(logoPath)) {
        logoPath = null;
      }
    }

    if (logoPath) {
      try {
        let imageBuffer = logoPath.endsWith(".webp")
          ? await sharp(logoPath).toFormat("png").toBuffer()
          : fs.readFileSync(logoPath);
        doc.image(imageBuffer, 20, 20, { height: 50, fit: [50, 50] });
      } catch (imageError) {
        console.error("Error loading logo image:", imageError);
      }
    }

    doc
      .font("Times-Bold")
      .fontSize(12)
      .text(response.schoolDetails.schoolname || "", { align: "right" })
      .moveDown(0.2)
      .fontSize(10)
      .text(response.schoolDetails.motto || "", { align: "right" })
      .moveDown(0.2)
      .text(response.schoolDetails.address || "", { align: "right" })
      .moveDown(0.2)
      .text(response.schoolDetails.phone || "", { align: "right" })
      .moveDown(1);

    const pageWidth = doc.page.width;
    const y = 85;
    const titleBgColor = "#bfdbfe";

    doc.rect(20, y - 5, pageWidth - 40, 20).fill(titleBgColor);
    doc
      .fillColor("black")
      .font("Times-Bold")
      .fontSize(12)
      .text(
        `SUBJECT PERFORMANCE ANALYSIS - FORM ${response.examDetails?.form} ${response.examDetails?.examname} ${response.examDetails?.year}` || "",
        {
          align: "center",
        }
      )
      .moveDown(0.5);

    const grades = [
      "E",
      "D-",
      "D",
      "D+",
      "C-",
      "C",
      "C+",
      "B-",
      "B",
      "B+",
      "A-",
      "A",
    ];
    const gradePoints = {
      E: 1,
      "D-": 2,
      D: 3,
      "D+": 4,
      "C-": 5,
      C: 6,
      "C+": 7,
      "B-": 8,
      B: 9,
      "B+": 10,
      "A-": 11,
      A: 12,
    };

    const performanceData = response.performanceData;
    let currentY = y + 30;

    performanceData.forEach((subject) => {
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
        totalPages++;
      }

      // Subject title with consistent black color
      doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor("black")
        .text(`${subject.code} - ${subject.name}`, 20, currentY);
      currentY += 20;

      const tableTop = currentY;
      const tableLeft = 20;
      const rowHeight = 20;
      const totalWidth = pageWidth - 40;

      // Calculate column widths
      const fixedColWidths = {
        enrolment: 60,
        stream: 60,
        avgPoints: 60,
        grade: 40,
        instructor: 80,
        rank: 40,
      };

      const totalFixedWidth = Object.values(fixedColWidths).reduce(
        (sum, w) => sum + w,
        0
      );
      const gradeColWidth = (totalWidth - totalFixedWidth) / grades.length;

      const colWidths = {
        ...fixedColWidths,
        ...Object.fromEntries(grades.map((grade) => [grade, gradeColWidth])),
      };

      const headers = [
        "Enrolment",
        "Stream",
        ...grades,
        "Avg. Pts",
        "Grade",
        "Instructor",
        "Rank",
      ];

      // Draw header with grid lines
      doc.font("Times-Bold").fontSize(8);
      let headerX = tableLeft;

      // Draw top grid line
      doc
        .moveTo(headerX, tableTop)
        .lineTo(headerX + totalWidth, tableTop)
        .stroke();

      headers.forEach((header, i) => {
        const width =
          i === 0
            ? colWidths.enrolment
            : i === 1
            ? colWidths.stream
            : i < 2 + grades.length
            ? colWidths[grades[i - 2]]
            : i === 2 + grades.length
            ? colWidths.avgPoints
            : i === 3 + grades.length
            ? colWidths.grade
            : i === 4 + grades.length
            ? colWidths.instructor
            : colWidths.rank;

        // Header background and text
        doc
          .rect(headerX, tableTop, width, rowHeight)
          .fill(titleBgColor)
          .fillColor("black")
          .text(header, headerX + 2, tableTop + 5, {
            width: width - 4,
            align: "center",
          });

        // Vertical grid lines
        doc
          .moveTo(headerX, tableTop)
          .lineTo(headerX, tableTop + rowHeight)
          .stroke();
        headerX += width;
      });

      // Right border and bottom grid line
      doc
        .moveTo(headerX, tableTop)
        .lineTo(headerX, tableTop + rowHeight)
        .stroke();
      doc
        .moveTo(tableLeft, tableTop + rowHeight)
        .lineTo(tableLeft + totalWidth, tableTop + rowHeight)
        .stroke();

      currentY += rowHeight;

      // Draw data rows with grid lines
      doc.font("Times-Roman").fontSize(8);
      subject.streams.forEach((stream) => {
        if (currentY > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
          totalPages++;
        }

        let rowX = tableLeft;

        // Draw horizontal grid line
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX + totalWidth, currentY)
          .stroke();

        // Draw left vertical grid line
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Enrolment
        doc.text(stream.enrolment.toString(), rowX + 2, currentY + 5, {
          width: colWidths.enrolment - 4,
          align: "center",
        });
        rowX += colWidths.enrolment;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Stream
        doc.text(stream.name, rowX + 2, currentY + 5, {
          width: colWidths.stream - 4,
          align: "center",
        });
        rowX += colWidths.stream;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Grades
        grades.forEach((grade) => {
          doc.text(
            (stream.grades[grade] || 0).toString(),
            rowX + 2,
            currentY + 5,
            {
              width: colWidths[grade] - 4,
              align: "center",
            }
          );
          rowX += colWidths[grade];
          doc
            .moveTo(rowX, currentY)
            .lineTo(rowX, currentY + rowHeight)
            .stroke();
        });

        // Average Points
        doc.text(stream.avgPoints.toString(), rowX + 2, currentY + 5, {
          width: colWidths.avgPoints - 4,
          align: "center",
        });
        rowX += colWidths.avgPoints;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Grade
        const gradeValue = stream.avgPoints;
        let letterGrade = "E";
        if (gradeValue >= 12) letterGrade = "A";
        else if (gradeValue >= 11) letterGrade = "A-";
        else if (gradeValue >= 10) letterGrade = "B+";
        else if (gradeValue >= 9) letterGrade = "B";
        else if (gradeValue >= 8) letterGrade = "B-";
        else if (gradeValue >= 7) letterGrade = "C+";
        else if (gradeValue >= 6) letterGrade = "C";
        else if (gradeValue >= 5) letterGrade = "C-";
        else if (gradeValue >= 4) letterGrade = "D+";
        else if (gradeValue >= 3) letterGrade = "D";
        else if (gradeValue >= 2) letterGrade = "D-";

        doc.text(letterGrade, rowX + 2, currentY + 5, {
          width: colWidths.grade - 4,
          align: "center",
        });
        rowX += colWidths.grade;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Instructor
        doc.text(subject.instructor, rowX + 2, currentY + 5, {
          width: colWidths.instructor - 4,
          align: "center",
        });
        rowX += colWidths.instructor;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Rank
        const streamRank =
          [...subject.streams]
            .sort((a, b) => b.avgPoints - a.avgPoints)
            .findIndex((s) => s.name === stream.name) + 1;
        doc.text(streamRank.toString(), rowX + 2, currentY + 5, {
          width: colWidths.rank - 4,
          align: "center",
        });
        rowX += colWidths.rank;
        doc
          .moveTo(rowX, currentY)
          .lineTo(rowX, currentY + rowHeight)
          .stroke();

        // Bottom grid line
        doc
          .moveTo(tableLeft, currentY + rowHeight)
          .lineTo(tableLeft + totalWidth, currentY + rowHeight)
          .stroke();
        currentY += rowHeight;
      });

      // Overall row with same styling as other rows
      let overallX = tableLeft;

      // Draw horizontal grid line
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX + totalWidth, currentY)
        .stroke();

      // Draw left vertical grid line
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Label
      doc.font("Times-Bold").text("OVERALL", overallX + 2, currentY + 5, {
        width: colWidths.enrolment + colWidths.stream - 4,
        align: "right",
      });
      overallX += colWidths.enrolment;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();
      overallX += colWidths.stream;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Sum of all grades
      const totalEnrolment = subject.streams.reduce(
        (sum, stream) => sum + stream.enrolment,
        0
      );
      grades.forEach((grade) => {
        const sum = subject.streams.reduce(
          (sum, stream) => sum + (stream.grades[grade] || 0),
          0
        );
        doc.text(sum.toString(), overallX + 2, currentY + 5, {
          width: colWidths[grade] - 4,
          align: "center",
        });
        overallX += colWidths[grade];
        doc
          .moveTo(overallX, currentY)
          .lineTo(overallX, currentY + rowHeight)
          .stroke();
      });

      // Overall average
      doc.text(subject.overallAvg.toString(), overallX + 2, currentY + 5, {
        width: colWidths.avgPoints - 4,
        align: "center",
      });
      overallX += colWidths.avgPoints;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Overall grade
      const overallGradeValue = subject.overallAvg;
      let overallLetterGrade = "E";
      if (overallGradeValue >= 12) overallLetterGrade = "A";
      else if (overallGradeValue >= 11) overallLetterGrade = "A-";
      else if (overallGradeValue >= 10) overallLetterGrade = "B+";
      else if (overallGradeValue >= 9) overallLetterGrade = "B";
      else if (overallGradeValue >= 8) overallLetterGrade = "B-";
      else if (overallGradeValue >= 7) overallLetterGrade = "C+";
      else if (overallGradeValue >= 6) overallLetterGrade = "C";
      else if (overallGradeValue >= 5) overallLetterGrade = "C-";
      else if (overallGradeValue >= 4) overallLetterGrade = "D+";
      else if (overallGradeValue >= 3) overallLetterGrade = "D";
      else if (overallGradeValue >= 2) overallLetterGrade = "D-";

      doc.text(overallLetterGrade, overallX + 2, currentY + 5, {
        width: colWidths.grade - 4,
        align: "center",
      });
      overallX += colWidths.grade;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Instructor (empty for overall)
      doc.text("", overallX + 2, currentY + 5, {
        width: colWidths.instructor - 4,
        align: "center",
      });
      overallX += colWidths.instructor;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Subject rank
      doc.text(subject.rank.toString(), overallX + 2, currentY + 5, {
        width: colWidths.rank - 4,
        align: "center",
      });
      overallX += colWidths.rank;
      doc
        .moveTo(overallX, currentY)
        .lineTo(overallX, currentY + rowHeight)
        .stroke();

      // Bottom grid line
      doc
        .moveTo(tableLeft, currentY + rowHeight)
        .lineTo(tableLeft + totalWidth, currentY + rowHeight)
        .stroke();
      currentY += rowHeight + 15;
    });

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
