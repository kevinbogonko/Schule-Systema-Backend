import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. HEADER FUNCTION
const addHeader = (doc, response) => {
    try {
        let logoPath;
        if (response.schoolDetails && 
            response.schoolDetails[0] && 
            response.schoolDetails[0].logo && 
            fs.existsSync(path.join(__dirname, '../images/', response.schoolDetails[0].logo))) {
            logoPath = path.join(__dirname, '../images/', response.schoolDetails[0].logo);
        } else {
            logoPath = path.join(__dirname, '../../../public/images/defaults', 'logo.jpeg');
        }
    
        doc.image(logoPath, 20, 20, { height: 50 });
    
        doc.font('Times-Bold').fontSize(12)
            .text(response.schoolDetails[0]?.schoolname || '', { align: 'right' });
    
        doc.moveDown(0.2);
        doc.font('Times-Bold').fontSize(10)
            .text(response.schoolDetails[1]?.motto || '', { align: 'right' });
    
        doc.moveDown(0.2);
        doc.font('Times-Bold').fontSize(10)
            .text(response.schoolDetails[2]?.address || '', { align: 'right' });
    
        doc.moveDown(0.2);
        doc.font('Times-Bold').fontSize(10)
            .text(response.schoolDetails[3]?.phone || '', { align: 'right' });
    
        doc.moveDown(1);
    } catch (err) {
        console.error('Error adding header:', err);
        throw err;
    }
};

// 2. QR CODE GENERATION
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
                dark: '#0000FF',
                light: '#FFFFFF'
            },
            margin: 1,
            scale: 5
        });
    } catch (err) {
        console.error('Error generating QR code:', err);
        return null;
    }
};

// 3. GRADE CONVERSION
const gradeToValue = (grade) => {
    switch(grade) {
        case 'A': return 12;
        case 'A-': return 11;
        case 'B+': return 10;
        case 'B': return 9;
        case 'B-': return 8;
        case 'C+': return 7;
        case 'C': return 6;
        case 'C-': return 5;
        case 'D+': return 4;
        case 'D': return 3;
        case 'D-': return 2;
        case 'E': return 1;
        default: return 0;
    }
};

// 4. MAIN PDF GENERATION
export const generateStudentReportPdf = async (response) => {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ 
            margin: 20,
            bufferPages: true,
            size: 'A4'
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        try {
            for (const [index, student] of response.studentResults.entries()) {
                try {
                    // Start new page for each student (except first)
                    if (index > 0) {
                        doc.addPage();
                    }

                    // 1. Add Header
                    addHeader(doc, response);
                    
                    // 2. Main title
                    const pageWidth = doc.page.width;
                    const backgroundWidth = pageWidth - 40;
                    const y = 85;

                    doc.rect(20, y - 5, backgroundWidth, 20)
                        .fill('#bfdbfe');

                    doc.fillColor('black')
                        .font('Times-Bold').fontSize(12)
                        .text(`TERM ${response.examDetails.term} - ${response.examDetails.examname} - ASSESSMENT REPORT FORM ${response.examDetails.year}`.toUpperCase(), { 
                            align: 'center'
                        });
                    
                    doc.moveDown(0.5);

                    // 3. Student info section
                    const imageWidth = 60;
                    const imageY = 105;

                    // Load student image or fallback
                    let imagePath = student.student_image
                        ? path.resolve(student.student_image)
                        : path.join(__dirname, '../images/', 'user_p.jpeg');

                    if (!fs.existsSync(imagePath)) {
                        imagePath = path.join(
                          __dirname,
                          "../../../public/images/defaults",
                          "user.jpg"
                        );
                    }

                    doc.image(imagePath, 20, imageY, { height: 60, width: imageWidth });

                    const lineX = 20 + imageWidth + 10;
                    const lineHeight = 60;

                    doc.moveTo(lineX, imageY)
                        .lineTo(lineX, imageY + lineHeight)
                        .lineWidth(0.5)
                        .strokeColor('grey')
                        .stroke();

                    const textX = lineX + 10;
                    const textY = imageY;

                    doc.fontSize(10)
                        .fillColor('black')
                        .font('Times-Roman')
                        .text(`NAME : ${student.name}`.toUpperCase(), textX, textY, { width: 300, align: 'left' })
                        .moveDown(0.5)
                        .text(`REG. No : ${student.id}`.toUpperCase(), textX, textY + 12, { width: 300, align: 'left' })
                        .moveDown(0.5)
                        .text(`FORM : ${response.examDetails.form}`.toUpperCase(), textX, textY + 24, { width: 300, align: 'left' })
                        .moveDown(0.5)
                        .text(`STREAM : ${student.stream}`.toUpperCase(), textX, textY + 36, { width: 300, align: 'left' })
                        .moveDown(0.5)
                        .text(`KCPE : ${student.kcpe_marks}`, textX, textY + 48, { width: 300, align: 'left' });

                    // 4. Performance graph
                    const perfGraphX = textX + 250;
                    const perfGraphY = textY;
                    const perfGraphWidth = pageWidth - perfGraphX - 40;
                    const perfBarHeight = 18;
                    const perfMaxGrade = 12;
                    const perfUnitWidth = perfGraphWidth / perfMaxGrade;

                    const gradeCurrent = gradeToValue(student.ag_grade);
                    const gradeRecent = gradeToValue(student.recent_grade);

                    doc.moveTo(perfGraphX - 10, perfGraphY)
                        .lineTo(perfGraphX - 10, imageY + lineHeight)
                        .lineWidth(0.5)
                        .strokeColor('grey')
                        .stroke();

                    doc.fontSize(10)
                        .font('Times-Roman')
                        .fillColor('black')
                        .text('Recent performance'.toUpperCase(), perfGraphX, imageY, {
                            width: perfGraphWidth,
                            align: 'left'
                        });

                    doc.fontSize(10)
                        .fillColor('#4caf50')
                        .text(`${student.current_init}`, perfGraphX, imageY + 20, {width: 30})

                    doc.rect(perfGraphX + 30, imageY + 15, gradeCurrent * perfUnitWidth, perfBarHeight)
                        .fillColor('#4caf50')
                        .fill();

                    doc.fontSize(10)
                        .fillColor('#2196f3')
                        .text(`${student.recent_init}`, perfGraphX, imageY + 40, {width: 30})

                    doc.rect(perfGraphX + 30, imageY + 35, gradeRecent * perfUnitWidth, perfBarHeight)
                        .fillColor('#2196f3')
                        .fill();

                    // 5. Metrics section
                    const rectHeight = 35;
                    const rectY = imageY + lineHeight + 5;
                    const rectWidth = pageWidth - 40;
                    const columnWidth = rectWidth / 5;

                    const labelFontSize = 10;
                    const valueFontSize = 12;
                    const labelLineHeight = 10;
                    const valueLineHeight = 12;
                    const totalTextHeight = labelLineHeight + valueLineHeight;
                    const verticalPadding = (rectHeight - totalTextHeight) / 2;

                    const labelY = rectY + verticalPadding;
                    const valueY = labelY + labelLineHeight;

                    doc.rect(20, rectY, rectWidth, rectHeight).fill('#10B981');

                    doc.font('Times-Bold').fillColor('white');

                    const metrics = [
                        { label: 'Total Marks', value: student.total_marks },
                        { label: 'Total Points', value: student.total_points },
                        { label: 'Mean Grade', value: student.ag_grade },
                        { label: 'Stream Position', value: student.stream_position },
                        { label: 'Overall Position', value: student.overal_position }
                    ];

                    metrics.forEach((item, i) => {
                        const x = 25 + columnWidth * i;

                        doc.fontSize(labelFontSize)
                            .text(item.label, x, labelY, { width: columnWidth, align: 'center' });

                        doc.fontSize(valueFontSize)
                            .text(item.value, x, valueY, { width: columnWidth, align: 'center' });
                    });

                    for (let i = 1; i < 5; i++) {
                        doc.moveTo(20 + (columnWidth * i), rectY)
                            .lineTo(20 + (columnWidth * i), rectY + rectHeight)
                            .lineWidth(0.5)
                            .strokeColor('white')
                            .stroke();
                    }

                    // 6. Results table
                    const tableStartY = rectY + rectHeight + 10;

                    const markTypes = new Set();
                    student.results.forEach(result => {
                        Object.keys(result.marks).forEach(key => {
                            if (key !== 'mark' && key !== 'grade') {
                                markTypes.add(key);
                            }
                        });
                    });
                    const dynamicMarkColumns = Array.from(markTypes);

                    const staticColumns = [
                        { key: 'code', label: 'Code' },
                        { key: 'subject', label: 'Subject' },
                        { key: 'mark', label: 'Mark' },
                        { key: 'grade', label: 'Grd' },
                        { key: 'points', label: 'Pts' },
                        { key: 'rank', label: 'Rank' },
                        { key: 'remarks', label: 'Remarks' },
                        { key: 'instructor', label: 'Inst.' }
                    ];

                    dynamicMarkColumns.forEach(markType => {
                        staticColumns.splice(2, 0, {
                            key: markType.toLowerCase().replace(' ', '_'),
                            label: markType
                        });
                    });

                    const totalTableWidth = pageWidth - 40;
                    const baseWidths = {
                        code: 35,
                        subject: 40,
                        mark: 35,
                        grade: 30,
                        points: 25,
                        rank: 35,
                        remarks: 135,
                        instructor: 40
                    };

                    dynamicMarkColumns.forEach(markType => {
                        const key = markType.toLowerCase().replace(' ', '_');
                        baseWidths[key] = 50;
                    });

                    const expectedTotalWidth = Object.values(baseWidths).reduce((a, b) => a + b, 0);
                    const remainingWidth = totalTableWidth - expectedTotalWidth;

                    if (remainingWidth > 0) {
                        baseWidths.subject += remainingWidth;
                    } else {
                        baseWidths.subject = Math.max(60, baseWidths.subject + remainingWidth);
                    }

                    const tableData = student.results.map(result => {
                        const row = {
                            code: result.code,
                            subject: result.subject,
                            mark: result.marks.mark,
                            grade: result.marks.grade,
                            points: result.points,
                            rank: result.rank,
                            remarks: result.remarks,
                            instructor: result.instructor
                        };

                        dynamicMarkColumns.forEach(markType => {
                            const key = markType.toLowerCase().replace(' ', '_');
                            row[key] = result.marks[markType] || '';
                        });

                        return row;
                    });

                    const startX = 20;
                    const startY = tableStartY;
                    const headerRowHeight = 30;
                    const rowHeight = 20;

                    doc.rect(startX, startY, totalTableWidth, headerRowHeight).fill('#BFDBFE');

                    doc.font('Times-Bold').fontSize(10).fillColor('black');

                    let x = startX;
                    staticColumns.forEach(col => {
                        const width = baseWidths[col.key];

                        const textHeight = doc.heightOfString(col.label, {width: width -10})
                        const verticalPadding = (headerRowHeight - textHeight) / 2
                        doc.text(col.label, x + 5, startY + verticalPadding, {
                            width: width - 10,
                            align: 'left'
                        });
                        x += width;
                    });

                    x = startX;
                    staticColumns.forEach((col, colIndex) => {
                        const width = baseWidths[col.key];
                        if (colIndex > 0) {
                            doc.moveTo(x, startY)
                                .lineTo(x, startY + headerRowHeight)
                                .lineWidth(0.5)
                                .strokeColor('#9CA3AF')
                                .stroke();
                        }
                        x += width;
                    });

                    let currentY = startY + headerRowHeight;

                    tableData.forEach((row, rowIndex) => {
                        let colX = startX;
                        
                        staticColumns.forEach((col, colIndex) => {
                            const width = baseWidths[col.key];
                            if (colIndex > 0) {
                                doc.moveTo(colX, currentY)
                                    .lineTo(colX, currentY + rowHeight)
                                    .lineWidth(0.5)
                                    .strokeColor('#E5E7EB')
                                    .stroke();
                            }
                            colX += width;
                        });

                        colX = startX;
                        staticColumns.forEach(col => {
                            const key = col.key;
                            const value = row[key] !== undefined ? row[key] : '';
                            const width = baseWidths[key];

                            doc.font('Times-Roman').fontSize(10).fillColor('black');
                            doc.text(String(value), colX + 5, currentY + 5, { width, align: 'left' });

                            colX += width;
                        });

                        doc.moveTo(startX, currentY + rowHeight)
                            .lineTo(startX + totalTableWidth, currentY + rowHeight)
                            .lineWidth(0.5)
                            .strokeColor('#E5E7EB')
                            .stroke();

                        currentY += rowHeight;
                    });

                    doc.rect(startX, startY, totalTableWidth, currentY - startY)
                        .lineWidth(1)
                        .strokeColor('#9CA3AF')
                        .stroke();

                    // 7. Bottom section
                    const verticalLineYStart = currentY + 20;
                    const verticalLineHeight = 225;
                    const pageMiddleX = pageWidth / 2;

                    doc.moveTo(pageMiddleX, verticalLineYStart)
                        .lineTo(pageMiddleX, verticalLineYStart + verticalLineHeight)
                        .lineWidth(1)
                        .strokeColor('#9CA3AF')
                        .stroke();

                    // 8. Grade comparison graph
                    const graphMargin = 10;
                    const graphX = 20;
                    const graphY = verticalLineYStart + 30;
                    const graphWidth = pageMiddleX - graphX - graphMargin;
                    const graphHeight = 120;

                    doc.font('Times-Bold').fontSize(11)
                        .text('Grade Comparison', graphX, verticalLineYStart + 5);

                    const kcpeValue = gradeToValue(student.kcpe_grade);
                    const agValue = gradeToValue(student.ag_grade);
                    const maxValue = 12;

                    const barWidth = 30;
                    const spacing = (graphWidth - (2 * barWidth)) / 3;
                    const maxBarHeight = graphHeight - 30;

                    doc.font('Times-Roman').fontSize(8);
                    [1, 4, 8, 12].forEach((val) => {
                        const yPos = graphY + maxBarHeight - (val / maxValue) * maxBarHeight;

                        doc.text(val.toString(), graphX, yPos - 5, {
                            align: 'right',
                            width: 15
                        });

                        doc.moveTo(graphX + 15, yPos)
                            .lineTo(graphX + graphWidth, yPos)
                            .lineWidth(0.2)
                            .strokeColor('#E5E7EB')
                            .stroke();
                    });

                    const kcpeBarHeight = (kcpeValue / maxValue) * maxBarHeight;
                    const kcpeBarX = graphX + 25;
                    const kcpeBarY = graphY + maxBarHeight - kcpeBarHeight;

                    doc.rect(kcpeBarX, kcpeBarY, barWidth, kcpeBarHeight)
                        .fill('#3b82f6')
                        .stroke('#1d4ed8');

                    doc.font('Times-Roman').fontSize(8)
                        .fillColor('black')
                        .text('KCPE', kcpeBarX, graphY + maxBarHeight + 5, {
                            width: barWidth,
                            align: 'center'
                        });

                    const agBarHeight = (agValue / maxValue) * maxBarHeight;
                    const agBarX = kcpeBarX + barWidth + 20;
                    const agBarY = graphY + maxBarHeight - agBarHeight;

                    doc.rect(agBarX, agBarY, barWidth, agBarHeight)
                        .fill('#10b981')
                        .stroke('#047857');

                    doc.font('Times-Roman').fontSize(8)
                        .fillColor('black')
                        .text('AG', agBarX, graphY + maxBarHeight + 5, {
                            width: barWidth,
                            align: 'center'
                        });

                    // 9. School dates
                    const schoolDatesY = verticalLineYStart + maxBarHeight + 50;
                    
                    doc.rect(20, schoolDatesY, pageMiddleX - 30, 20)
                        .fill('#bfdbfe');
                    
                    doc.fillColor('black')
                        .font('Times-Roman').fontSize(12)
                        .text('School Dates'.toUpperCase(), 25, schoolDatesY + 6);
                    
                    doc.font('Times-Roman').fontSize(11)
                        .text(`Closing Date : 30/03/2025`, 25, schoolDatesY + 30)
                        .text(`Opening Date : 28/04/2025`, 25, schoolDatesY + 45);

                    // 10. Remarks section
                    const classTeacherSignaturePath = student.classTeacherSignature || null;
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

                    if (classTeacherSignaturePath && fs.existsSync(classTeacherSignaturePath)) {
                        doc.image(classTeacherSignaturePath, pageMiddleX + 10 + 200, verticalLineYStart + 20, {
                            width: (pageMiddleX * 2 - 30) - (pageMiddleX + 10 + 200),
                            height: 30
                        });
                    } else {
                        doc.moveTo(pageMiddleX + 10 + 200, verticalLineYStart + 50)
                            .lineTo(pageMiddleX * 2 - 30, verticalLineYStart + 50)
                            .stroke('black');
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
                        doc.image(principalSignaturePath, pageMiddleX + 10 + 200, verticalLineYStart + 95, {
                            width: (pageMiddleX * 2 - 30) - (pageMiddleX + 10 + 200),
                            height: 30
                        });
                    } else {
                        doc.moveTo(pageMiddleX + 10 + 200, verticalLineYStart + 125)
                            .lineTo(pageMiddleX * 2 - 30, verticalLineYStart + 125)
                            .stroke('black');
                    }

                    doc.font('Times-Bold').fontSize(11)
                        .text('Parent\'s Signature :', pageMiddleX + 10, verticalLineYStart + 140, {width: 200})
                        .text('__________', pageMiddleX + 10 + 200, verticalLineYStart + 140, {width: (pageMiddleX - 30) - 200})

                    // 11. QR Code
                    const qrCode = await generateQRCode(student, response.examDetails);
                    if (qrCode) {
                        const qrX = pageMiddleX + 10;
                        const qrY = verticalLineYStart + 160;
                        const qrSize = 60;
                        
                        doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4)
                            .fill('#0000FF');
                        
                        doc.image(qrCode, qrX, qrY, {width: qrSize, height: qrSize});
                        
                        doc.font('Times-Bold').fontSize(8)
                            .fillColor('#0000FF')
                            .text('STUDENT INFO', qrX, qrY + qrSize + 5, {
                                width: qrSize,
                                align: 'center'
                            });
                        doc.font('Times-Bold').fontSize(10)
                            .fillColor('black')
                            .text('Scan the QR Code for a unique code to authenticate results', 
                                pageMiddleX + 20 + qrSize, 
                                verticalLineYStart + 180, 
                                {width: (pageMiddleX - 40) - qrSize})
                    }

                } catch (err) {
                    console.error(`Error generating page for student ${student.id}:`, err);
                    throw err;
                }
            }

            doc.end();
        } catch (err) {
            console.error('PDF generation failed:', err);
            reject(err);
        }
    });
};

export default {
    generateStudentReportPdf,
    helpers: {
        addHeader,
        generateQRCode,
        gradeToValue
    }
};