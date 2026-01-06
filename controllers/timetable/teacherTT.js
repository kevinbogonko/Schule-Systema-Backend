import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Main function to generate PDF
export const generateTeacherTTPDF = async (ttPDFData, callback = () => {}) => {
  try {
    // Extract data from ttPDFData
    const {
      timeSlots = [],
      days = [],
      lessons = [],
      schoolDetails = {},
      title = "",
      classTag = "",
    } = ttPDFData;

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

    let isFirstPage = true;

    let logoPath = schoolDetails.logoPath
      ? path.join(__dirname, "../../public", schoolDetails.logoPath)
      : "";

    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, "../../public/images/defaults/logo.jpeg");
      if (!fs.existsSync(logoPath)) {
        logoPath = null;
      }
    }

    const addHeader = async () => {
      if (!isFirstPage) return;

      if (logoPath) {
        try {
          let imageBuffer;
          if (logoPath.endsWith(".webp")) {
            imageBuffer = await sharp(logoPath).toFormat("png").toBuffer();
          } else {
            imageBuffer = fs.readFileSync(logoPath);
          }
          doc.image(imageBuffer, 20, 20, { height: 70, fit: [50, 50] });
        } catch (err) {
          console.error("Error loading logo:", err);
        }
      }

      doc
        .font("Times-Bold")
        .fontSize(12)
        .text(schoolDetails.schoolname || "", { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.motto || "", { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.address || "", { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.phone || "", { align: "right" });
      doc.moveDown(1);

      const pageWidth = doc.page.width;
      const backgroundWidth = pageWidth - 40;
      const y = 100;
      const titleBgColor = "#bfdbfe";

      doc.rect(20, y - 5, backgroundWidth, 30).fill(titleBgColor);
      doc
        .fillColor("black")
        .font("Times-Bold")
        .fontSize(16)
        .text(title, 20, y + 5, {
          align: "center",
          width: backgroundWidth,
        });
      doc.moveDown(1.5);
    };

    const findLesson = (day, timeSlotId, classTag) => {
      return lessons.find(
        (lesson) =>
          lesson.day === day.name &&
          lesson.timeSlot_id === timeSlotId &&
          lesson.class_tag === classTag
      );
    };

    const getBreakLunchText = (type, dayIndex, daysCount) => {
      const breakLetters = ["B", "R", "E", "A", "K"];
      const lunchLetters = ["L", "U", "N", "C", "H"];

      if (daysCount < 5) {
        return type === "break" ? "BREAK" : "LUNCH";
      }

      return type === "break" ? breakLetters[dayIndex] : lunchLetters[dayIndex];
    };

    const canMergeLessons = (day, timeSlotId, classTag) => {
      const currentLesson = findLesson(day, timeSlotId, classTag);
      if (!currentLesson) return false;

      const prevTimeSlot = timeSlots.find((ts) => ts.id === timeSlotId - 1);
      if (prevTimeSlot && prevTimeSlot.type === "lesson") {
        const prevLesson = findLesson(day, timeSlotId - 1, classTag);
        if (prevLesson && prevLesson.alias === currentLesson.alias) {
          return { mergeWithPrev: true };
        }
      }

      const nextTimeSlot = timeSlots.find((ts) => ts.id === timeSlotId + 1);
      if (nextTimeSlot && nextTimeSlot.type === "lesson") {
        const nextLesson = findLesson(day, timeSlotId + 1, classTag);
        if (nextLesson && nextLesson.alias === currentLesson.alias) {
          return { mergeWithNext: true };
        }
      }

      return false;
    };

    const addTimetableGrid = () => {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const tableTop = isFirstPage ? 150 : 50;
      const tableLeft = 20;
      const dayRowHeight = 25;
      const lessonRowHeight = 60;
      const firstColWidth = 60;
      const timeSlotColWidth =
        (pageWidth - 40 - firstColWidth) / timeSlots.length;

      const drawTableHeader = () => {
        if (!isFirstPage) return;

        const numberingRowHeight = 15;
        const numberingRowTop = tableTop - numberingRowHeight;

        doc
          .rect(tableLeft, numberingRowTop, firstColWidth, numberingRowHeight)
          .fillAndStroke("#bfdbfe", "#666666");

        let timeSlotX = tableLeft + firstColWidth;
        let lessonNumber = 1;

        timeSlots.forEach((slot) => {
          if (slot.type === "lesson") {
            doc
              .rect(
                timeSlotX,
                numberingRowTop,
                timeSlotColWidth,
                numberingRowHeight
              )
              .fillAndStroke("#bfdbfe", "#666666");
            doc
              .fillColor("black")
              .font("Times-Bold")
              .fontSize(10)
              .text(
                lessonNumber.toString(),
                timeSlotX + 5,
                numberingRowTop + 3,
                {
                  width: timeSlotColWidth - 10,
                  align: "center",
                }
              );
            lessonNumber++;
          } else {
            doc
              .rect(
                timeSlotX,
                numberingRowTop,
                timeSlotColWidth,
                numberingRowHeight
              )
              .fillAndStroke("#bfdbfe", "#666666");
          }
          timeSlotX += timeSlotColWidth;
        });

        doc
          .rect(tableLeft, tableTop, firstColWidth, dayRowHeight)
          .fillAndStroke("#bfdbfe", "#666666");
        doc
          .fillColor("black")
          .font("Times-Bold")
          .fontSize(10)
          .text("Day/Time", tableLeft + 5, tableTop + 8, {
            width: firstColWidth - 10,
            align: "center",
          });

        timeSlotX = tableLeft + firstColWidth;
        timeSlots.forEach((slot) => {
          doc
            .rect(timeSlotX, tableTop, timeSlotColWidth, dayRowHeight)
            .fillAndStroke("#bfdbfe", "#666666");
          doc
            .fillColor("black")
            .font("Times-Bold")
            .fontSize(8)
            .text(slot.label, timeSlotX + 5, tableTop + 8, {
              width: timeSlotColWidth - 10,
              align: "center",
            });
          timeSlotX += timeSlotColWidth;
        });
      };

      drawTableHeader();

      let currentY = tableTop + (isFirstPage ? dayRowHeight : 0);
      let dayStartY = currentY;

      const verticalLines = new Set();
      verticalLines.add(tableLeft);
      verticalLines.add(tableLeft + firstColWidth);

      days.forEach((day, dayIndex) => {
        const dayHeight = lessonRowHeight;

        if (currentY + dayHeight > pageHeight - 20) {
          doc.addPage();
          isFirstPage = false;
          currentY = 50;
          dayStartY = currentY;
          verticalLines.clear();
          verticalLines.add(tableLeft);
          verticalLines.add(tableLeft + firstColWidth);
        }

        doc
          .rect(tableLeft, currentY, firstColWidth, dayHeight)
          .fillAndStroke("#ffffff", "#666666");
        doc
          .fillColor("black")
          .font("Times-Bold")
          .fontSize(10)
          .text(day.name, tableLeft + 5, currentY + dayHeight / 2 - 5, {
            width: firstColWidth - 10,
            align: "center",
          });

        let timeSlotX = tableLeft + firstColWidth;
        timeSlots.forEach((slot, slotIndex) => {
          const isBreakOrLunch = slot.type === "break" || slot.type === "lunch";
          if (isBreakOrLunch) {
            doc
              .rect(timeSlotX, currentY, timeSlotColWidth, dayHeight)
              .fillAndStroke("#f0f0f0", "#666666");

            const displayText = getBreakLunchText(
              slot.type,
              dayIndex,
              days.length
            );
            const textHeight = 12;
            const textWidth = 30;
            const centerX = timeSlotX + timeSlotColWidth / 2 - textWidth;
            const centerY = currentY + dayHeight / 2 - textHeight / 2;

            doc
              .fillColor("black")
              .font("Times-Bold")
              .fontSize(12)
              .text(displayText, centerX, centerY, {
                width: timeSlotColWidth,
                align: "center",
              });
          }
          timeSlotX += timeSlotColWidth;
        });

        let timeSlotX2 = tableLeft + firstColWidth;
        let skipNext = false;
        let mergedCells = [];

        timeSlots.forEach((slot, slotIndex) => {
          if (skipNext) {
            skipNext = false;
            timeSlotX2 += timeSlotColWidth;
            return;
          }

          const isBreakOrLunch = slot.type === "break" || slot.type === "lunch";
          if (isBreakOrLunch) {
            timeSlotX2 += timeSlotColWidth;
            return;
          }

          const lessonsForSlot = lessons.filter(
            (lesson) =>
              lesson.day === day.name && lesson.timeSlot_id === slot.id
          );

          if (lessonsForSlot.length > 0) {
            lessonsForSlot.forEach((lesson) => {
              const mergeInfo = canMergeLessons(day, slot.id, lesson.class_tag);
              const shouldSkip = mergeInfo && mergeInfo.mergeWithPrev;

              if (!shouldSkip) {
                const cellWidth =
                  mergeInfo && mergeInfo.mergeWithNext
                    ? timeSlotColWidth * 2
                    : timeSlotColWidth;

                doc
                  .rect(timeSlotX2, currentY, cellWidth, dayHeight)
                  .fill("#ffffff");

                doc
                  .fillColor("black")
                  .font("Times-Bold")
                  .fontSize(10)
                  .text(lesson.class_tag, timeSlotX2 + 5, currentY + 5, {
                    width: cellWidth - 10,
                    align: "left",
                  });

                doc
                  .fillColor("black")
                  .font("Times-Roman")
                  .fontSize(10)
                  .text(lesson.alias, timeSlotX2 + 5, currentY + 30, {
                    width: cellWidth - 10,
                    align: "center",
                  });

                doc
                  .rect(timeSlotX2, currentY, cellWidth, dayHeight)
                  .stroke("#666666");

                if (mergeInfo && mergeInfo.mergeWithNext) {
                  skipNext = true;
                }
              }
            });
          } else {
            doc
              .rect(timeSlotX2, currentY, timeSlotColWidth, dayHeight)
              .fillAndStroke("#ffffff", "#666666");
          }

          timeSlotX2 += timeSlotColWidth;
        });

        currentY += dayHeight;

        doc.strokeColor("#666666");
        doc.lineWidth(1);

        doc
          .moveTo(tableLeft, dayStartY)
          .lineTo(
            tableLeft + firstColWidth + timeSlots.length * timeSlotColWidth,
            dayStartY
          )
          .stroke();
        doc
          .moveTo(tableLeft, currentY)
          .lineTo(
            tableLeft + firstColWidth + timeSlots.length * timeSlotColWidth,
            currentY
          )
          .stroke();

        const sortedLines = Array.from(verticalLines).sort((a, b) => a - b);
        sortedLines.forEach((x) => {
          doc.moveTo(x, dayStartY).lineTo(x, currentY).stroke();
        });

        verticalLines.clear();
        verticalLines.add(tableLeft);
        verticalLines.add(tableLeft + firstColWidth);
      });
    };

    await addHeader();
    addTimetableGrid();
    doc.end();
  } catch (error) {
    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("PDF generation error:", error);
    }
  }
};
