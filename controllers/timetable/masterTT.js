import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Main function to generate PDF
export const generateMasterTTPDF = async (data, callback = () => {}) => {
  try {
    // Destructure data from the response object
    const { streams, days, timeSlots, lessons, schoolDetails, title } = data;

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

    // Helper function to find lesson for a specific day, time slot, and class
    const findLesson = (day, timeSlotId, classId) => {
      return lessons.find(
        (lesson) =>
          lesson.day === day.name &&
          lesson.timeSlot_id === timeSlotId &&
          lesson.class_id === classId
      );
    };

    // Helper function to check if previous or next lesson is the same and can be merged
    const canMergeLesson = (day, timeSlotId, classId) => {
      const currentLesson = findLesson(day, timeSlotId, classId);
      if (!currentLesson) return false;

      // Check previous time slot
      const prevTimeSlot = timeSlots.find((ts) => ts.id === timeSlotId - 1);
      if (prevTimeSlot && prevTimeSlot.type === "lesson") {
        const prevLesson = findLesson(day, timeSlotId - 1, classId);
        if (
          prevLesson &&
          prevLesson.alias === currentLesson.alias &&
          JSON.stringify(prevLesson.teacher_tag) ===
            JSON.stringify(currentLesson.teacher_tag)
        ) {
          return { mergeWithPrev: true };
        }
      }

      // Check next time slot
      const nextTimeSlot = timeSlots.find((ts) => ts.id === timeSlotId + 1);
      if (nextTimeSlot && nextTimeSlot.type === "lesson") {
        const nextLesson = findLesson(day, timeSlotId + 1, classId);
        if (
          nextLesson &&
          nextLesson.alias === currentLesson.alias &&
          JSON.stringify(nextLesson.teacher_tag) ===
            JSON.stringify(currentLesson.teacher_tag)
        ) {
          return { mergeWithNext: true };
        }
      }

      return false;
    };

    // Function to add key page
    const addKeyPage = (doc) => {
      doc.addPage();

      // Add title
      doc.font("Times-Bold").fontSize(16).text("KEY", { align: "center" });
      doc.moveDown(1);

      // Split page into two columns
      const pageWidth = doc.page.width - 40;
      const columnWidth = pageWidth / 2 - 20;
      const startY = 100;

      // Get unique teacher tags and names
      const teacherMap = new Map();
      lessons.forEach((lesson) => {
        lesson.teacher_tag.forEach((tag, index) => {
          if (!teacherMap.has(tag)) {
            teacherMap.set(tag, lesson.teacher[index]);
          }
        });
      });
      const sortedTeachers = Array.from(teacherMap.entries()).sort(
        (a, b) => a[0] - b[0]
      );

      // Get unique subject aliases and groups
      const subjectMap = new Map();
      lessons.forEach((lesson) => {
        if (!subjectMap.has(lesson.alias)) {
          subjectMap.set(lesson.alias, lesson.subject_group.join(", "));
        }
      });
      const sortedSubjects = Array.from(subjectMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      // Left column - Teachers
      doc.font("Times-Bold").fontSize(12).text("TEACHERS", 20, startY);

      let currentY = startY + 30;
      sortedTeachers.forEach(([tag, name]) => {
        doc
          .font("Times-Roman")
          .fontSize(10)
          .text(`${tag}: ${name}`, 20, currentY);
        currentY += 20;
      });

      // Right column - Subjects
      doc
        .font("Times-Bold")
        .fontSize(12)
        .text("SUBJECTS", 20 + columnWidth + 20, startY);

      currentY = startY + 30;
      sortedSubjects.forEach(([alias, group]) => {
        doc
          .font("Times-Roman")
          .fontSize(10)
          .text(`${alias}: ${group}`, 20 + columnWidth + 20, currentY);
        currentY += 20;
      });
    };

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
        .text(schoolDetails.schoolname, { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.motto, { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.address, { align: "right" });
      doc.moveDown(0.2);
      doc
        .font("Times-Bold")
        .fontSize(10)
        .text(schoolDetails.phone, { align: "right" });
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

    const addTimetableGrid = () => {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const tableTop = isFirstPage ? 150 : 50;
      const tableLeft = 20;
      const dayRowHeight = 25;
      const streamRowHeight = 30;
      const firstColWidth = 60;
      const streamsColWidth = 40;

      const availableWidth = pageWidth - 40 - firstColWidth - streamsColWidth;
      const timeSlotColWidth = availableWidth / timeSlots.length;

      const drawTableHeader = () => {
        if (!isFirstPage) return;

        // Add new numbering row above the existing header
        const numberingRowHeight = 15;
        const numberingRowTop = tableTop - numberingRowHeight;

        // Draw empty cells for first column and streams column
        doc
          .rect(tableLeft, numberingRowTop, firstColWidth, numberingRowHeight)
          .fillAndStroke("#bfdbfe", "#666666");
        doc
          .rect(
            tableLeft + firstColWidth,
            numberingRowTop,
            streamsColWidth,
            numberingRowHeight
          )
          .fillAndStroke("#bfdbfe", "#666666");

        // Add numbering to timeslot columns
        let timeSlotX = tableLeft + firstColWidth + streamsColWidth;
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

        // Original header row (moved down by numberingRowHeight)
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

        doc
          .rect(
            tableLeft + firstColWidth,
            tableTop,
            streamsColWidth,
            dayRowHeight
          )
          .fillAndStroke("#bfdbfe", "#666666");
        doc
          .fillColor("black")
          .font("Times-Bold")
          .fontSize(10)
          .text("Class", tableLeft + firstColWidth + 5, tableTop + 8, {
            width: streamsColWidth - 10,
            align: "center",
          });

        timeSlotX = tableLeft + firstColWidth + streamsColWidth;
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

      // Store which columns should have vertical lines
      const verticalLines = new Set();
      verticalLines.add(tableLeft);
      verticalLines.add(tableLeft + firstColWidth);
      verticalLines.add(tableLeft + firstColWidth + streamsColWidth);

      days.forEach((day, dayIndex) => {
        const dayHeight = streams.length * streamRowHeight;

        if (currentY + dayHeight > pageHeight - 20) {
          doc.addPage();
          isFirstPage = false;
          currentY = 50;
          dayStartY = currentY;
          verticalLines.clear();
          verticalLines.add(tableLeft);
          verticalLines.add(tableLeft + firstColWidth);
          verticalLines.add(tableLeft + firstColWidth + streamsColWidth);
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

        // First pass: Draw all break/lunch cells
        let timeSlotX = tableLeft + firstColWidth + streamsColWidth;
        timeSlots.forEach((slot, slotIndex) => {
          const isBreakOrLunch = slot.type === "break" || slot.type === "lunch";
          if (isBreakOrLunch) {
            doc
              .rect(timeSlotX, currentY, timeSlotColWidth, dayHeight)
              .fillAndStroke("#f0f0f0", "#666666");

            const breakText = slot.type === "break" ? "BREAK" : "LUNCH";
            const textHeight = 12;
            const textWidth = 30;
            const centerX = timeSlotX + timeSlotColWidth / 2 - textWidth;
            const centerY = currentY + dayHeight / 2 - textHeight / 2;

            // Show full text if days are less than 5, otherwise first letter
            const displayText =
              days.length < 5
                ? breakText
                : breakText[dayIndex % breakText.length];

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

        // Second pass: Draw lessons for each stream
        streams.forEach((stream, streamIndex) => {
          const streamY = currentY + streamIndex * streamRowHeight;

          doc
            .rect(
              tableLeft + firstColWidth,
              streamY,
              streamsColWidth,
              streamRowHeight
            )
            .fillAndStroke("#f0f0f0", "#666666");
          doc
            .fillColor("black")
            .font("Times-Roman")
            .fontSize(9)
            .text(stream.name, tableLeft + firstColWidth + 5, streamY + 10, {
              width: streamsColWidth - 10,
              align: "center",
            });

          let timeSlotX = tableLeft + firstColWidth + streamsColWidth;
          let skipNext = false;
          let mergedCells = [];

          timeSlots.forEach((slot, slotIndex) => {
            if (skipNext) {
              skipNext = false;
              timeSlotX += timeSlotColWidth;
              return;
            }

            const isBreakOrLunch =
              slot.type === "break" || slot.type === "lunch";
            if (isBreakOrLunch) {
              timeSlotX += timeSlotColWidth;
              return;
            }

            const mergeInfo = canMergeLesson(day, slot.id, stream.class_id);
            const shouldSkip = mergeInfo && mergeInfo.mergeWithPrev;

            if (!shouldSkip) {
              const cellWidth =
                mergeInfo && mergeInfo.mergeWithNext
                  ? timeSlotColWidth * 2
                  : timeSlotColWidth;

              // Draw white background for the cell or merged cells
              doc
                .rect(timeSlotX, streamY, cellWidth, streamRowHeight)
                .fill("#ffffff");

              const lesson = findLesson(day, slot.id, stream.class_id);
              if (lesson) {
                const teacherTags = lesson.teacher_tag.join(", ");
                const lessonText = `${lesson.alias} (${teacherTags})`;
                doc
                  .fillColor("black")
                  .font("Times-Roman")
                  .fontSize(10)
                  .text(lessonText, timeSlotX + 5, streamY + 10, {
                    width: cellWidth - 10,
                    align: "center",
                  });
              }

              // Draw border for the cell or merged cells
              doc
                .rect(timeSlotX, streamY, cellWidth, streamRowHeight)
                .stroke("#666666");

              if (mergeInfo && mergeInfo.mergeWithNext) {
                skipNext = true;
              }
            }

            timeSlotX += timeSlotColWidth;
          });
        });

        currentY += dayHeight;

        // Draw all vertical lines for this day
        doc.strokeColor("#666666");
        doc.lineWidth(1);

        // Draw horizontal lines
        doc
          .moveTo(tableLeft, dayStartY)
          .lineTo(
            tableLeft +
              firstColWidth +
              streamsColWidth +
              timeSlots.length * timeSlotColWidth,
            dayStartY
          )
          .stroke();
        doc
          .moveTo(tableLeft, currentY)
          .lineTo(
            tableLeft +
              firstColWidth +
              streamsColWidth +
              timeSlots.length * timeSlotColWidth,
            currentY
          )
          .stroke();

        // Draw vertical lines in order
        const sortedLines = Array.from(verticalLines).sort((a, b) => a - b);
        sortedLines.forEach((x) => {
          doc.moveTo(x, dayStartY).lineTo(x, currentY).stroke();
        });

        // Clear vertical lines for next day
        verticalLines.clear();
        verticalLines.add(tableLeft);
        verticalLines.add(tableLeft + firstColWidth);
        verticalLines.add(tableLeft + firstColWidth + streamsColWidth);
      });
    };

    await addHeader();
    addTimetableGrid();
    addKeyPage(doc);
    doc.end();
  } catch (error) {
    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("PDF generation error:", error);
    }
  }
};
