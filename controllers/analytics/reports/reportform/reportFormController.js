// 1. Add import statements
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sharp from "sharp";

// 2. Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 3. Define system844 array
const system844 = [19, 20, 21, 22];

// 4. HEADER FUNCTION - MODIFIED TO HANDLE WEBP IMAGES
const addHeader = async (doc, response) => {
  try {
    let logoPath;
    let imageBuffer;

    // 5. Check if custom logo exists
    if (
      response.schoolDetails &&
      response.schoolDetails[4] &&
      response.schoolDetails[4].logo
    ) {
      const customLogoPath = path.join(
        __dirname,
        "../../../../public",
        response.schoolDetails[4].logo
      );

      if (fs.existsSync(customLogoPath)) {
        logoPath = customLogoPath;
      } else {
        // 6. Check if webp version exists
        const webpPath = customLogoPath.replace(/\.[^/.]+$/, ".webp");
        if (fs.existsSync(webpPath)) {
          logoPath = webpPath;
        }
      }
    }

    // 7. Fallback to default logo if no custom logo found
    if (!logoPath) {
      const defaultLogoPath = path.join(
        __dirname,
        "../../../../public/images/defaults",
        "logo.jpeg"
      );
      const defaultWebpPath = path.join(
        __dirname,
        "../../../../public/images/defaults",
        "logo.webp"
      );

      if (fs.existsSync(defaultWebpPath)) {
        logoPath = defaultWebpPath;
      } else if (fs.existsSync(defaultLogoPath)) {
        logoPath = defaultLogoPath;
      } else {
        throw new Error("No logo file found");
      }
    }

    // 8. Convert webp to buffer if needed
    if (logoPath.endsWith(".webp")) {
      imageBuffer = await sharp(logoPath).toFormat("png").toBuffer();
      doc.image(imageBuffer, 20, 20, { height: 50 });
    } else {
      doc.image(logoPath, 20, 20, { height: 50 });
    }

    // 9. Add school details text
    doc
      .font("Times-Bold")
      .fontSize(12)
      .text(response.schoolDetails[0]?.schoolname || "", { align: "right" });

    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails[1]?.motto || "", { align: "right" });

    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails[2]?.address || "", { align: "right" });

    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text(response.schoolDetails[3]?.phone || "", { align: "right" });

    doc.moveDown(1);
  } catch (err) {
    console.error("Error adding header:", err);
    throw err;
  }
};

// 10. QR CODE GENERATION
const generateQRCode = async (studentData, examDetails) => {
  try {
    const qrData = JSON.stringify({
      studentId: studentData.id,
      name: studentData.name,
      form: examDetails.form,
      term: examDetails.term,
      year: examDetails.year,
    });

    return await QRCode.toDataURL(qrData, {
      color: {
        dark: "#0000FF",
        light: "#FFFFFF",
      },
      margin: 1,
      scale: 5,
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
};

// 11. GRADE CONVERSION FOR 844
const gradeToValue = (grade) => {
  switch (grade) {
    case "A":
      return 12;
    case "A-":
      return 11;
    case "B+":
      return 10;
    case "B":
      return 9;
    case "B-":
      return 8;
    case "C+":
      return 7;
    case "C":
      return 6;
    case "C-":
      return 5;
    case "D+":
      return 4;
    case "D":
      return 3;
    case "D-":
      return 2;
    case "E":
      return 1;
    default:
      return 0;
  }
};

// 12. GRADE CONVERSION FOR CBC
const gradeToValueCBC = (grade) => {
  switch (grade) {
    case "EE":
      return 4;
    case "ME":
      return 3;
    case "AE":
      return 2;
    case "BE":
      return 1;
    default:
      return 0;
  }
};

// 13. DETERMINE SYSTEM TYPE
const is844System = (form) => {
  const form844 = [19, 20, 21, 22];
  return form844.includes(parseInt(form));
};

// 14. MAIN PDF GENERATION
export const generateStudentReportPdf = async (response) => {
  return new Promise(async (resolve, reject) => {
    // 15. Create PDF document
    const doc = new PDFDocument({
      margin: 20,
      bufferPages: true,
      size: "A4",
    });

    // 16. Setup document events
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      // 17. Determine if CBC system
      const isCBC = !is844System(response.examDetails.form);

      // 18. Process each student
      for (const [index, student] of response.studentResults.entries()) {
        try {
          // 19. Start new page for each student (except first)
          if (index > 0) {
            doc.addPage();
          }

          // 20. Add Header
          await addHeader(doc, response);

          // 21. Main title - Different for CBC and 844
          const pageWidth = doc.page.width;
          const backgroundWidth = pageWidth - 40;
          const y = 85;

          doc.rect(20, y - 5, backgroundWidth, 20).fill("#bfdbfe");

          const nonCBCFormMap = {
            19 : 1,
            20 : 2,
            21 : 3,
            22 : 4,
          }

          const reportTitle = isCBC
            ? `TERM ${response.examDetails.term} - ${response.examDetails.examname} - SUMMATIVE ASSESSMENT REPORT ${response.examDetails.year}`.toUpperCase()
            : `TERM ${response.examDetails.term} - ${response.examDetails.examname} - ASSESSMENT REPORT FORM ${nonCBCFormMap[response.examDetails.form]} - ${response.examDetails.year}`.toUpperCase();

          doc
            .fillColor("black")
            .font("Times-Bold")
            .fontSize(12)
            .text(reportTitle, {
              align: "center",
            });

          doc.moveDown(0.5);

          // 22. Student info section
          const imageWidth = 60;
          const imageY = 105;

          // 23. Load student image or fallback
          let imagePath = student.image_path
            ? path.join(__dirname, "../../../../public", student.image_path)
            : path.join(__dirname, "../../images/", "user_p.jpeg");

          if (!fs.existsSync(imagePath)) {
            // 24. Check for webp version if original doesn't exist
            const webpPath = imagePath.replace(/\.[^/.]+$/, ".webp");
            if (fs.existsSync(webpPath)) {
              imagePath = webpPath;
            } else {
              // 25. Fallback to default images
              const defaultImagePath = path.join(
                __dirname,
                "../../../../public/images/defaults",
                "user.jpg"
              );
              const defaultWebpPath = path.join(
                __dirname,
                "../../../../public/images/defaults",
                "user.webp"
              );

              if (fs.existsSync(defaultWebpPath)) {
                imagePath = defaultWebpPath;
              } else if (fs.existsSync(defaultImagePath)) {
                imagePath = defaultImagePath;
              } else {
                throw new Error("No default user image found");
              }
            }
          }

          // 26. Handle webp images for student photos
          if (imagePath.endsWith(".webp")) {
            try {
              const imageBuffer = await sharp(imagePath)
                .toFormat("png")
                .toBuffer();
              doc.image(imageBuffer, 20, imageY, {
                height: 60,
                width: imageWidth,
              });
            } catch (err) {
              console.error("Error processing webp image:", err);
              // 27. Fallback to default image if webp processing fails
              const defaultImagePath = path.join(
                __dirname,
                "../../../../public/images/defaults",
                "user.jpg"
              );
              doc.image(defaultImagePath, 20, imageY, {
                height: 60,
                width: imageWidth,
              });
            }
          } else {
            doc.image(imagePath, 20, imageY, { height: 60, width: imageWidth });
          }

          const lineX = 20 + imageWidth + 10;
          const lineHeight = 60;

          doc
            .moveTo(lineX, imageY)
            .lineTo(lineX, imageY + lineHeight)
            .lineWidth(0.5)
            .strokeColor("grey")
            .stroke();

          const textX = lineX + 10;
          const textY = imageY;

          // 28. Add student info text
          doc
            .fontSize(10)
            .fillColor("black")
            .font("Times-Roman")
            .text(`NAME : ${student.name}`.toUpperCase(), textX, textY, {
              width: 300,
              align: "left",
            })
            .moveDown(0.5)
            .text(`REG. No : ${student.id}`.toUpperCase(), textX, textY + 12, {
              width: 300,
              align: "left",
            })
            .moveDown(0.5)
            .text(
              `${
                system844.includes(Number(response.examDetails.form))
                  ? "FORM"
                  : "GRADE"
              } : ${system844.includes(Number(response.examDetails.form)) ? nonCBCFormMap[response.examDetails.form] : response.examDetails.form}`.toUpperCase(),
              textX,
              textY + 24,
              { width: 300, align: "left" },
            )
            .moveDown(0.5)
            .text(
              `STREAM : ${student.stream}`.toUpperCase(),
              textX,
              textY + 36,
              { width: 300, align: "left" },
            )
            .moveDown(0.5);

          if (!isCBC) {
            doc.text(`KCPE : ${student.kcpe_marks}`, textX, textY + 48, {
              width: 300,
              align: "left",
            });
          }

          // 29. Performance graph
          const perfGraphX = textX + 250;
          const perfGraphY = textY;
          const perfGraphWidth = pageWidth - perfGraphX - 40;
          const perfBarHeight = 18;
          const perfMaxGrade = isCBC ? 4 : 12;
          const perfUnitWidth = perfGraphWidth / perfMaxGrade;

          const gradeCurrent = isCBC
            ? gradeToValueCBC(student.ag_grade)
            : gradeToValue(student.ag_grade);
          const gradeRecent = isCBC
            ? gradeToValueCBC(student.recent_grade)
            : gradeToValue(student.recent_grade);

          doc
            .moveTo(perfGraphX - 10, perfGraphY)
            .lineTo(perfGraphX - 10, imageY + lineHeight)
            .lineWidth(0.5)
            .strokeColor("grey")
            .stroke();

          doc
            .fontSize(10)
            .font("Times-Roman")
            .fillColor("black")
            .text("Recent performance".toUpperCase(), perfGraphX, imageY, {
              width: perfGraphWidth,
              align: "left",
            });

          doc
            .fontSize(10)
            .fillColor("#4caf50")
            .text(`${student.current_init}`, perfGraphX, imageY + 20, {
              width: 30,
            });

          doc
            .rect(
              perfGraphX + 30,
              imageY + 15,
              gradeCurrent * perfUnitWidth,
              perfBarHeight
            )
            .fillColor("#4caf50")
            .fill();

          doc
            .fontSize(10)
            .fillColor("#2196f3")
            .text(`${student.recent_init}`, perfGraphX, imageY + 40, {
              width: 30,
            });

          doc
            .rect(
              perfGraphX + 30,
              imageY + 35,
              gradeRecent * perfUnitWidth,
              perfBarHeight
            )
            .fillColor("#2196f3")
            .fill();

          // 30. Metrics section
          const rectHeight = 35;
          const rectY = imageY + lineHeight + 5;
          const rectWidth = pageWidth - 40;

          let metrics;
          let columnWidth;

          if (isCBC) {
            // 31. CBC: Display EE, ME, AE, BE legend
            metrics = [
              { label: "EE(4)", value: "Exceeds Expectation" },
              { label: "ME(3)", value: "Meets Expectation" },
              { label: "AE(2)", value: "Approaches Expectation" },
              { label: "BE(1)", value: "Below Expectation" },
            ];
            columnWidth = rectWidth / 4;
          } else {
            // 32. 844: Display regular metrics
            metrics = [
              { label: "Total Marks", value: student.total_marks },
              { label: "Total Points", value: student.total_points },
              { label: "Mean Grade", value: student.ag_grade },
              { label: "Stream Position", value: student.stream_position },
              { label: "Overall Position", value: student.overal_position },
            ];
            columnWidth = rectWidth / 5;
          }

          const labelFontSize = isCBC ? 9 : 10;
          const valueFontSize = isCBC ? 8 : 12;
          const labelLineHeight = isCBC ? 9 : 10;
          const valueLineHeight = isCBC ? 8 : 12;
          const totalTextHeight = labelLineHeight + valueLineHeight;
          const verticalPadding = (rectHeight - totalTextHeight) / 2;

          const labelY = rectY + verticalPadding;
          const valueY = labelY + labelLineHeight;

          doc.rect(20, rectY, rectWidth, rectHeight).fill("#10B981");

          doc.font("Times-Bold").fillColor("white");

          // 33. Draw metrics
          metrics.forEach((item, i) => {
            const x = 25 + columnWidth * i;

            doc.fontSize(labelFontSize).text(item.label, x, labelY, {
              width: columnWidth - 10,
              align: "center",
            });

            doc.fontSize(valueFontSize).text(item.value, x, valueY, {
              width: columnWidth - 10,
              align: "center",
            });
          });

          const numDividers = isCBC ? 3 : 4;
          for (let i = 1; i <= numDividers; i++) {
            doc
              .moveTo(20 + columnWidth * i, rectY)
              .lineTo(20 + columnWidth * i, rectY + rectHeight)
              .lineWidth(0.5)
              .strokeColor("white")
              .stroke();
          }

          // 34. Results table
          const tableStartY = rectY + rectHeight + 10;

          let staticColumns;
          let baseWidths;

          if (isCBC) {
            // 35. CBC table structure
            staticColumns = [
              { key: "code", label: "Code" },
              { key: "subject", label: "Learning Area" },
              {
                key: "assessment_1_score",
                label: "Score",
                parentLabel: "Assessment 1",
                isSubColumn: true,
              },
              {
                key: "assessment_1_pl",
                label: "PL",
                parentLabel: "Assessment 1",
                isSubColumn: true,
              },
              {
                key: "assessment_2_score",
                label: "Score",
                parentLabel: "Assessment 2",
                isSubColumn: true,
              },
              {
                key: "assessment_2_pl",
                label: "PL",
                parentLabel: "Assessment 2",
                isSubColumn: true,
              },
              {
                key: "assessment_3_score",
                label: "Score",
                parentLabel: "Assessment 3",
                isSubColumn: true,
              },
              {
                key: "assessment_3_pl",
                label: "PL",
                parentLabel: "Assessment 3",
                isSubColumn: true,
              },
            ];

            baseWidths = {
              code: 40,
              subject: 100,
              assessment_1_score: 40,
              assessment_1_pl: 35,
              assessment_2_score: 40,
              assessment_2_pl: 35,
              assessment_3_score: 40,
              assessment_3_pl: 35,
            };
          } else {
            // 36. 844 table structure
            const markTypes = new Set();
            student.results.forEach((result) => {
              Object.keys(result.marks).forEach((key) => {
                if (key !== "mark" && key !== "grade") {
                  markTypes.add(key);
                }
              });
            });
            const dynamicMarkColumns = Array.from(markTypes);

            staticColumns = [
              { key: "code", label: "Code" },
              { key: "subject", label: "Subject" },
              { key: "mark", label: "Mark" },
              { key: "grade", label: "Grd" },
              { key: "points", label: "Pts" },
              { key: "rank", label: "Rank" },
              { key: "remarks", label: "Remarks" },
              { key: "instructor", label: "Inst." },
            ];

            dynamicMarkColumns.forEach((markType) => {
              staticColumns.splice(2, 0, {
                key: markType.toLowerCase().replace(" ", "_"),
                label: markType,
              });
            });

            baseWidths = {
              code: 35,
              subject: 40,
              mark: 35,
              grade: 30,
              points: 25,
              rank: 35,
              remarks: 135,
              instructor: 40,
            };

            dynamicMarkColumns.forEach((markType) => {
              const key = markType.toLowerCase().replace(" ", "_");
              baseWidths[key] = 50;
            });
          }

          const totalTableWidth = pageWidth - 40;
          const expectedTotalWidth = Object.values(baseWidths).reduce(
            (a, b) => a + b,
            0
          );
          const remainingWidth = totalTableWidth - expectedTotalWidth;

          if (remainingWidth > 0) {
            baseWidths.subject += remainingWidth;
          } else {
            baseWidths.subject = Math.max(
              60,
              baseWidths.subject + remainingWidth
            );
          }

          let tableData;

          if (isCBC) {
            // 37. CBC table data
            tableData = student.results.map((result) => {
              const row = {
                code: result.code || "",
                subject: result.subject,
              };

              // 38. Get all available mark types from the result
              const availableMarkTypes = Object.keys(result.marks).filter(
                (key) => key !== "mark" && key !== "grade"
              );

              // 39. Map available data to our 3 static assessment columns
              for (let i = 1; i <= 3; i++) {
                const scoreKey = `assessment_${i}_score`;
                const plKey = `assessment_${i}_pl`;

                if (i - 1 < availableMarkTypes.length) {
                  const markType = availableMarkTypes[i - 1];
                  const scoreValue = result.marks[markType];

                  row[scoreKey] = scoreValue === 0 ? "0" : scoreValue || "";
                  row[plKey] = result.marks.grade || "";
                } else {
                  row[scoreKey] = "";
                  row[plKey] = "";
                }
              }

              return row;
            });
          } else {
            // 40. 844 table data
            tableData = student.results.map((result) => {
              const row = {
                code: result.code,
                subject: result.subject,
                mark: result.marks.mark === 0 ? "0" : result.marks.mark,
                grade: result.marks.grade,
                points: result.points,
                rank: result.rank,
                remarks: result.remarks,
                instructor: result.instructor,
              };

              Object.keys(result.marks).forEach((markType) => {
                if (markType !== "mark" && markType !== "grade") {
                  const key = markType.toLowerCase().replace(" ", "_");
                  const value = result.marks[markType];
                  row[key] = value === 0 ? "0" : value || "";
                }
              });

              return row;
            });
          }

          const startX = 20;
          const startY = tableStartY;
          const headerRowHeight = 40; // Increased height for split header
          const rowHeight = 20;

          // 41. Draw table header background
          doc
            .rect(startX, startY, totalTableWidth, headerRowHeight)
            .fill("#BFDBFE");

          doc
            .font("Times-Bold")
            .fontSize(isCBC ? 9 : 10)
            .fillColor("black");

          if (isCBC) {
            // 42. MODIFIED: Split header into two horizontal bars
            // First, calculate column positions
            let columnPositions = [];
            let currentX = startX;

            staticColumns.forEach((col, index) => {
              const width = baseWidths[col.key];
              columnPositions.push({
                col,
                startX: currentX,
                endX: currentX + width,
                width: width,
              });
              currentX += width;
            });

            // 43. Draw upper bar (split into 4 sections)
            const upperBarHeight = 20;
            const lowerBarHeight = 20;

            // Draw horizontal divider line
            doc
              .moveTo(startX, startY + upperBarHeight)
              .lineTo(startX + totalTableWidth, startY + upperBarHeight)
              .lineWidth(0.5)
              .strokeColor("#9CA3AF")
              .stroke();

            // 44. Define the 4 sections for upper bar
            const sections = [
              { label: "", startCol: 0, endCol: 1 }, // First section (no label) - Code & Learning Area
              { label: "Assessment 1", startCol: 2, endCol: 3 }, // Second section - Score & PL for Assessment 1
              { label: "Assessment 2", startCol: 4, endCol: 5 }, // Third section - Score & PL for Assessment 2
              { label: "Assessment 3", startCol: 6, endCol: 7 }, // Fourth section - Score & PL for Assessment 3
            ];

            // 45. Draw upper bar sections
            sections.forEach((section) => {
              const startXPos = columnPositions[section.startCol].startX;
              const endXPos = columnPositions[section.endCol].endX;
              const sectionWidth = endXPos - startXPos;

              if (section.label) {
                // Center the label in the section
                doc.text(section.label, startXPos, startY + 5, {
                  width: sectionWidth,
                  align: "center",
                });
              }

              // Draw vertical dividers between sections (except for first section)
              if (section.startCol > 0) {
                doc
                  .moveTo(startXPos, startY)
                  .lineTo(startXPos, startY + upperBarHeight)
                  .lineWidth(0.5)
                  .strokeColor("#9CA3AF")
                  .stroke();
              }
            });

            // 46. Draw lower bar with column labels
            const lowerBarY = startY + upperBarHeight;

            columnPositions.forEach((colPos, index) => {
              const col = colPos.col;
              const width = colPos.width;
              const colX = colPos.startX;

              // Center the label in the lower bar
              const textHeight = doc.heightOfString(col.label, {
                width: width - 10,
              });
              const verticalPadding = (lowerBarHeight - textHeight) / 2;

              doc.text(col.label, colX + 5, lowerBarY + verticalPadding, {
                width: width - 10,
                align: "center",
              });

              // Draw vertical dividers between all columns
              if (index > 0) {
                doc
                  .moveTo(colX, lowerBarY)
                  .lineTo(colX, lowerBarY + lowerBarHeight)
                  .lineWidth(0.5)
                  .strokeColor("#9CA3AF")
                  .stroke();
              }
            });
          } else {
            // 47. 844: Original header drawing (unchanged)
            let x = startX;
            staticColumns.forEach((col) => {
              const width = baseWidths[col.key];

              const textHeight = doc.heightOfString(col.label, {
                width: width - 10,
              });
              const verticalPadding = (headerRowHeight - textHeight) / 2;
              doc.text(col.label, x + 5, startY + verticalPadding, {
                width: width - 10,
                align: "left",
              });
              x += width;
            });

            x = startX;
            staticColumns.forEach((col, colIndex) => {
              const width = baseWidths[col.key];
              if (colIndex > 0) {
                doc
                  .moveTo(x, startY)
                  .lineTo(x, startY + headerRowHeight)
                  .lineWidth(0.5)
                  .strokeColor("#9CA3AF")
                  .stroke();
              }
              x += width;
            });
          }

          let currentY = startY + headerRowHeight;

          // 48. Draw table rows
          tableData.forEach((row, rowIndex) => {
            let colX = startX;

            staticColumns.forEach((col, colIndex) => {
              const width = baseWidths[col.key];
              if (colIndex > 0) {
                doc
                  .moveTo(colX, currentY)
                  .lineTo(colX, currentY + rowHeight)
                  .lineWidth(0.5)
                  .strokeColor("#E5E7EB")
                  .stroke();
              }
              colX += width;
            });

            colX = startX;
            staticColumns.forEach((col) => {
              const key = col.key;
              const value = row[key] !== undefined ? row[key] : "";
              const width = baseWidths[key];

              doc
                .font("Times-Roman")
                .fontSize(isCBC ? 9 : 10)
                .fillColor("black");
              doc.text(String(value), colX + 5, currentY + 5, {
                width,
                align: "left",
              });

              colX += width;
            });

            doc
              .moveTo(startX, currentY + rowHeight)
              .lineTo(startX + totalTableWidth, currentY + rowHeight)
              .lineWidth(0.5)
              .strokeColor("#E5E7EB")
              .stroke();

            currentY += rowHeight;
          });

          doc
            .rect(startX, startY, totalTableWidth, currentY - startY)
            .lineWidth(1)
            .strokeColor("#9CA3AF")
            .stroke();

          // 49. Bottom section
          const verticalLineYStart = currentY + 20;
          const verticalLineHeight = 225;
          const pageMiddleX = pageWidth / 2;

          doc
            .moveTo(pageMiddleX, verticalLineYStart)
            .lineTo(pageMiddleX, verticalLineYStart + verticalLineHeight)
            .lineWidth(1)
            .strokeColor("#9CA3AF")
            .stroke();

          // 50. Grade comparison graph (only for 844)
          if (!isCBC) {
            const graphMargin = 10;
            const graphX = 20;
            const graphY = verticalLineYStart + 30;
            const graphWidth = pageMiddleX - graphX - graphMargin;
            const graphHeight = 120;

            doc
              .font("Times-Bold")
              .fontSize(11)
              .text(
                "KCPE Vs Agr. Grade Comparison",
                graphX,
                verticalLineYStart + 5
              );

            const kcpeValue = gradeToValue(student.kcpe_grade);
            const agValue = gradeToValue(student.ag_grade);
            const maxValue = 12;

            const barWidth = 30;
            const spacing = (graphWidth - 2 * barWidth) / 3;
            const maxBarHeight = graphHeight - 30;

            doc.font("Times-Roman").fontSize(8);
            [1, 4, 8, 12].forEach((val) => {
              const yPos =
                graphY + maxBarHeight - (val / maxValue) * maxBarHeight;

              doc.text(val.toString(), graphX, yPos - 5, {
                align: "right",
                width: 15,
              });

              doc
                .moveTo(graphX + 15, yPos)
                .lineTo(graphX + graphWidth, yPos)
                .lineWidth(0.2)
                .strokeColor("#E5E7EB")
                .stroke();
            });

            const kcpeBarHeight = (kcpeValue / maxValue) * maxBarHeight;
            const kcpeBarX = graphX + 25;
            const kcpeBarY = graphY + maxBarHeight - kcpeBarHeight;

            doc
              .rect(kcpeBarX, kcpeBarY, barWidth, kcpeBarHeight)
              .fill("#3b82f6")
              .stroke("#1d4ed8");

            doc
              .font("Times-Roman")
              .fontSize(8)
              .fillColor("black")
              .text("KCPE", kcpeBarX, graphY + maxBarHeight + 5, {
                width: barWidth,
                align: "center",
              });

            const agBarHeight = (agValue / maxValue) * maxBarHeight;
            const agBarX = kcpeBarX + barWidth + 20;
            const agBarY = graphY + maxBarHeight - agBarHeight;

            doc
              .rect(agBarX, agBarY, barWidth, agBarHeight)
              .fill("#10b981")
              .stroke("#047857");

            doc
              .font("Times-Roman")
              .fontSize(8)
              .fillColor("black")
              .text("AG", agBarX, graphY + maxBarHeight + 5, {
                width: barWidth,
                align: "center",
              });
          }

          // 51. School dates
          const schoolDatesY = isCBC
            ? verticalLineYStart + 10
            : verticalLineYStart + 160;

          doc.rect(20, schoolDatesY, pageMiddleX - 30, 20).fill("#bfdbfe");

          doc
            .fillColor("black")
            .font("Times-Roman")
            .fontSize(12)
            .text("School Dates".toUpperCase(), 25, schoolDatesY + 6);

          doc
            .font("Times-Roman")
            .fontSize(11)
            .text(`Closing Date : 30/03/2025`, 25, schoolDatesY + 30)
            .text(`Opening Date : 28/04/2025`, 25, schoolDatesY + 45);

          // 52. Remarks section
          const classTeacherSignaturePath =
            student.classTeacherSignature || null;
          const principalSignaturePath = student.principalSignature || null;

          doc
            .font("Times-Bold")
            .fontSize(11)
            .fillColor("black")
            .text(
              `Class Teacher's Remark : ${student.comments[0].class_teacher.officer_name}`,
              pageMiddleX + 10,
              verticalLineYStart + 10
            )
            .moveDown(0.2)
            .font("Times-Roman")
            .fontSize(11)
            .fillColor("black")
            .text(
              student.comments[0].class_teacher.say || "",
              pageMiddleX + 10,
              verticalLineYStart + 25,
              { width: 200 }
            );

          if (
            classTeacherSignaturePath &&
            fs.existsSync(classTeacherSignaturePath)
          ) {
            doc.image(
              classTeacherSignaturePath,
              pageMiddleX + 10 + 200,
              verticalLineYStart + 20,
              {
                width: pageMiddleX * 2 - 30 - (pageMiddleX + 10 + 200),
                height: 30,
              }
            );
          } else {
            doc
              .moveTo(pageMiddleX + 10 + 200, verticalLineYStart + 50)
              .lineTo(pageMiddleX * 2 - 30, verticalLineYStart + 50)
              .stroke("black");
          }

          doc
            .font("Times-Bold")
            .fontSize(11)
            .fillColor("black")
            .text(
              `Principal\'s Remark : ${student.comments[1].principal.officer_name}`,
              pageMiddleX + 10,
              verticalLineYStart + 80
            )
            .moveDown(0.2)
            .font("Times-Roman")
            .fontSize(11)
            .fillColor("black")
            .text(
              student.comments[1].principal.say || "",
              pageMiddleX + 10,
              verticalLineYStart + 95,
              { width: 200 }
            );

          if (principalSignaturePath && fs.existsSync(principalSignaturePath)) {
            doc.image(
              principalSignaturePath,
              pageMiddleX + 10 + 200,
              verticalLineYStart + 95,
              {
                width: pageMiddleX * 2 - 30 - (pageMiddleX + 10 + 200),
                height: 30,
              }
            );
          } else {
            doc
              .moveTo(pageMiddleX + 10 + 200, verticalLineYStart + 125)
              .lineTo(pageMiddleX * 2 - 30, verticalLineYStart + 125)
              .stroke("black");
          }

          doc
            .font("Times-Bold")
            .fontSize(11)
            .text(
              "Parent's Signature :",
              pageMiddleX + 10,
              verticalLineYStart + 140,
              { width: 200 }
            )
            .text(
              "__________",
              pageMiddleX + 10 + 200,
              verticalLineYStart + 140,
              { width: pageMiddleX - 30 - 200 }
            );

          // 53. QR Code
          const qrCode = await generateQRCode(student, response.examDetails);
          if (qrCode) {
            const qrX = pageMiddleX + 10;
            const qrY = verticalLineYStart + 160;
            const qrSize = 60;

            doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4).fill("#0000FF");

            doc.image(qrCode, qrX, qrY, { width: qrSize, height: qrSize });

            doc
              .font("Times-Bold")
              .fontSize(8)
              .fillColor("#0000FF")
              .text("STUDENT INFO", qrX, qrY + qrSize + 5, {
                width: qrSize,
                align: "center",
              });
            doc
              .font("Times-Bold")
              .fontSize(10)
              .fillColor("black")
              .text(
                "Scan the QR Code for a unique code to authenticate results",
                pageMiddleX + 20 + qrSize,
                verticalLineYStart + 180,
                { width: pageMiddleX - 40 - qrSize }
              );
          }
        } catch (err) {
          console.error(
            `Error generating page for student ${student.id}:`,
            err
          );
          throw err;
        }
      }

      // 54. End document
      doc.end();
    } catch (err) {
      console.error("PDF generation failed:", err);
      reject(err);
    }
  });
};

// 55. Export module
export default {
  generateStudentReportPdf,
  helpers: {
    addHeader,
    generateQRCode,
    gradeToValue,
    gradeToValueCBC,
    is844System,
  },
};
