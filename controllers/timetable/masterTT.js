import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dummy data for time slots
const timeSlots = [
  { id: 1, label: "08:00 - 08:40", type: "lesson" },
  { id: 2, label: "08:40 - 09:20", type: "lesson" },
  { id: 3, label: "09:20 - 09:30", type: "break" },
  { id: 4, label: "09:30 - 10:10", type: "lesson" },
  { id: 5, label: "10:10 - 10:50", type: "lesson" },
  { id: 6, label: "10:50 - 11:20", type: "break" },
  { id: 7, label: "11:20 - 12:00", type: "lesson" },
  { id: 8, label: "12:00 - 12:40", type: "lesson" },
  { id: 9, label: "12:40 - 14:00", type: "lunch" },
  { id: 10, label: "14:00 - 14:40", type: "lesson" },
  { id: 11, label: "14:40 - 15:20", type: "lesson" },
  { id: 12, label: "15:20 - 16:00", type: "lesson" },
];

// Dummy data for days
const days = [
  { name: "Monday", hasGames: false },
  { name: "Tuesday", hasGames: false },
  { name: "Wednesday", hasGames: true },
  { name: "Thursday", hasGames: false },
  { name: "Friday", hasGames: true },
];

// Dummy data for streams
const streams = [
  { id: 1, name: "1W", form: 1 },
  { id: 2, name: "1N", form: 1 },
  { id: 3, name: "1E", form: 1 },
  { id: 4, name: "1S", form: 1 },
];

// Dummy school details
const schoolDetails = {
  schoolname: "Sample High School",
  motto: "Education for Excellence",
  address: "123 School Road, Sample Town",
  phone: "+254 700 000000",
  logoPath: "", // Empty path for dummy data
};

// Main function to generate PDF
export const generateMasterTTPDF = async (callback = () => {}) => {
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

    // Set up logo path (empty for dummy data)
    let logoPath = "";

    // Function to add header
    const addHeader = async () => {
      if (logoPath && fs.existsSync(logoPath)) {
        try {
          let imageBuffer;
          if (logoPath.endsWith(".webp")) {
            imageBuffer = await sharp(logoPath).toFormat("png").toBuffer();
          } else {
            imageBuffer = fs.readFileSync(logoPath);
          }
          doc.image(imageBuffer, 20, 20, { height: 50, fit: [50, 50] });
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
      const y = 85;
      const titleBgColor = "#bfdbfe";

      doc.rect(20, y - 5, backgroundWidth, 30).fill(titleBgColor);
      doc
        .fillColor("black")
        .font("Times-Bold")
        .fontSize(16)
        .text("MASTER TIMETABLE 2025", 20, y, {
          align: "center",
          width: backgroundWidth,
        });
      doc.moveDown(1.5);
    };

    // Function to add timetable grid
    const addTimetableGrid = () => {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const tableTop = 130;
      const tableLeft = 20;
      const dayRowHeight = 20;
      const streamRowHeight = 15;
      const firstColWidth = 60;
      const streamColWidth = 40;
      const timeSlotColWidth = 50;

      // Calculate how many time slots can fit on the page
      const availableWidth = pageWidth - 40 - firstColWidth - streamColWidth;
      const maxTimeSlots = Math.floor(availableWidth / timeSlotColWidth);
      const displayedTimeSlots = timeSlots.slice(0, maxTimeSlots);

      // Draw table header
      doc
        .rect(tableLeft, tableTop, firstColWidth, dayRowHeight)
        .fill("#bfdbfe");
      doc
        .fillColor("black")
        .font("Times-Bold")
        .fontSize(10)
        .text("Day/Time", tableLeft + 5, tableTop + 5, {
          width: firstColWidth - 10,
          align: "center",
        });

      doc
        .rect(tableLeft + firstColWidth, tableTop, streamColWidth, dayRowHeight)
        .fill("#bfdbfe");
      doc
        .fillColor("black")
        .font("Times-Bold")
        .fontSize(10)
        .text("Streams", tableLeft + firstColWidth + 5, tableTop + 5, {
          width: streamColWidth - 10,
          align: "center",
        });

      let timeSlotX = tableLeft + firstColWidth + streamColWidth;
      displayedTimeSlots.forEach((slot) => {
        doc
          .rect(timeSlotX, tableTop, timeSlotColWidth, dayRowHeight)
          .fill("#bfdbfe");
        doc
          .fillColor("black")
          .font("Times-Bold")
          .fontSize(8)
          .text(slot.label, timeSlotX + 5, tableTop + 5, {
            width: timeSlotColWidth - 10,
            align: "center",
          });
        timeSlotX += timeSlotColWidth;
      });

      // Draw days and streams
      let currentY = tableTop + dayRowHeight;
      days.forEach((day) => {
        // Day row
        doc
          .rect(tableLeft, currentY, firstColWidth, dayRowHeight)
          .fill("#d1d5db");
        doc
          .fillColor("black")
          .font("Times-Bold")
          .fontSize(10)
          .text(day.name, tableLeft + 5, currentY + 5, {
            width: firstColWidth - 10,
            align: "center",
          });

        // Streams column for this day
        doc
          .rect(
            tableLeft + firstColWidth,
            currentY,
            streamColWidth,
            dayRowHeight
          )
          .fill("#e5e7eb");
        doc
          .fillColor("black")
          .font("Times-Roman")
          .fontSize(8)
          .text("All Streams", tableLeft + firstColWidth + 5, currentY + 5, {
            width: streamColWidth - 10,
            align: "center",
          });

        // Time slots columns for this day (empty for now)
        let timeSlotX = tableLeft + firstColWidth + streamColWidth;
        displayedTimeSlots.forEach(() => {
          doc
            .rect(timeSlotX, currentY, timeSlotColWidth, dayRowHeight)
            .fill("#f3f4f6");
          timeSlotX += timeSlotColWidth;
        });

        currentY += dayRowHeight;

        // Individual stream rows for this day
        streams.forEach((stream) => {
          doc
            .rect(tableLeft, currentY, firstColWidth, streamRowHeight)
            .fill("#f3f4f6");
          doc
            .rect(
              tableLeft + firstColWidth,
              currentY,
              streamColWidth,
              streamRowHeight
            )
            .fill("#f3f4f6");
          doc
            .fillColor("black")
            .font("Times-Roman")
            .fontSize(8)
            .text(stream.name, tableLeft + firstColWidth + 5, currentY + 3, {
              width: streamColWidth - 10,
              align: "center",
            });

          let timeSlotX = tableLeft + firstColWidth + streamColWidth;
          displayedTimeSlots.forEach(() => {
            doc
              .rect(timeSlotX, currentY, timeSlotColWidth, streamRowHeight)
              .fill("#ffffff");
            timeSlotX += timeSlotColWidth;
          });

          currentY += streamRowHeight;
        });
      });

      // Draw borders
      doc.strokeColor("#808080");
      // Vertical lines
      let x = tableLeft;
      doc.moveTo(x, tableTop).lineTo(x, currentY).stroke();
      x += firstColWidth;
      doc.moveTo(x, tableTop).lineTo(x, currentY).stroke();
      x += streamColWidth;
      displayedTimeSlots.forEach(() => {
        doc.moveTo(x, tableTop).lineTo(x, currentY).stroke();
        x += timeSlotColWidth;
      });
      doc.moveTo(x, tableTop).lineTo(x, currentY).stroke();

      // Horizontal lines
      let y = tableTop;
      doc.moveTo(tableLeft, y).lineTo(x, y).stroke();
      y += dayRowHeight;
      doc.moveTo(tableLeft, y).lineTo(x, y).stroke();

      days.forEach(() => {
        y += dayRowHeight;
        doc.moveTo(tableLeft, y).lineTo(x, y).stroke();
        streams.forEach(() => {
          y += streamRowHeight;
          doc.moveTo(tableLeft, y).lineTo(x, y).stroke();
        });
      });
    };

    // Generate the PDF
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

// Example usage with dummy data
generateMasterTTPDF((err, pdfData) => {
  if (err) {
    console.error("Error generating PDF:", err);
  } else {
    fs.writeFileSync("MasterTimetable.pdf", pdfData);
    console.log("PDF generated successfully");
  }
});
