// RAW CODE FOR PDF WITH HARD CODED DATA


import express from "express";
import PDFDocument from 'pdfkit';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/pdfs', async (req, res) => {
    try {
        // Validate request headers
        if (!req.accepts('application/pdf')) {
            return res.status(406).send('Not Acceptable - Client must accept application/pdf');
        }

        // Create document with proper error handling
        const doc = new PDFDocument({ 
            margin: 20,
            bufferPages: true
        });

        // Set proper response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=assessment_report.pdf');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');

        // Error handling for PDF generation
        doc.on('error', (err) => {
            console.error('PDF generation error:', err);
            if (!res.headersSent) {
                res.status(500).send('Error generating PDF');
            }
        });

        // Pipe the PDF to the response
        doc.pipe(res);

        // Data from the provided structure
        const response = {
            "schoolDetails": [
                {
                    "schoolname": "GREENFIELD ACADEMY"
                },
                {
                    "motto": "Striving for Excellence"
                },
                {
                    "address": "P.O. Box 12345 - 00100, Nairobi"
                },
                {
                    "phone": "+254712345678"
                },
                {
                    "logo": "/school_logo.png"
                },
                {
                    "class_teacher": {
                        "officer_name": "Mr. Eliot",
                        "say": "This is some dummy text of around ten words for testing purposes",
                        "signature": "/signatures/class_teacher.png"
                    }
                },
                {
                    "principal": {
                        "officer_name": "Mr. Eliot",
                        "say": "This is some dummy text of around ten words for testing purposes",
                        "signature": "/signatures/principal.png"
                    }
                }
            ],
            "examDetails": {
                "form": "4",
                "term": "1",
                "examname": "END TERM AVERAGE",
                "year": "2025"
            },
            "studentResults": [
                {
                    "id": 10134,
                    "name": "Kevin Kimaru",
                    "kcpe_marks": 335,
                    "kcpe_grade": "B+",
                    "ag_grade": "D-",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 56,
                                "END TERM": 0,
                                "mark": 28,
                                "grade": "C-"
                            },
                            "points": 5,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 61,
                                "END TERM": 0,
                                "mark": 30.5,
                                "grade": "D-"
                            },
                            "points": 2,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "59/700",
                    "total_points": "12/84",
                    "stream_position": "1/6",
                    "overal_position": "1/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/10134.jpg"
                },
                {
                    "id": 12451,
                    "name": "Mazraoui Kimaru",
                    "kcpe_marks": 335,
                    "kcpe_grade": "B+",
                    "ag_grade": "E",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 47,
                                "END TERM": 0,
                                "mark": 23.5,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "24/700",
                    "total_points": "7/84",
                    "stream_position": "2/6",
                    "overal_position": "2/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/12451.jpg"
                },
                {
                    "id": 35742,
                    "name": "Hendick Kim",
                    "kcpe_marks": 345,
                    "kcpe_grade": "B+",
                    "ag_grade": "E",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "3/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "0/700",
                    "total_points": "7/84",
                    "stream_position": "3/6",
                    "overal_position": "3/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/35742.jpg"
                },
                {
                    "id": 12459,
                    "name": "Christiano Ronaldo",
                    "kcpe_marks": 242,
                    "kcpe_grade": "B-",
                    "ag_grade": "E",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "3/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "0/700",
                    "total_points": "7/84",
                    "stream_position": "3/6",
                    "overal_position": "3/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/12459.jpg"
                },
                {
                    "id": 96545,
                    "name": "David Degea",
                    "kcpe_marks": 195,
                    "kcpe_grade": "C+",
                    "ag_grade": "E",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "3/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "0/700",
                    "total_points": "7/84",
                    "stream_position": "3/6",
                    "overal_position": "3/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/96545.jpg"
                },
                {
                    "id": 78972,
                    "name": "Amad Kimaru",
                    "kcpe_marks": 335,
                    "kcpe_grade": "B+",
                    "ag_grade": "E",
                    "current_init": "F4T1",
                    "recent_init": "F3T3",
                    "recent_grade": "E",
                    "results": [
                        {
                            "code": "101",
                            "subject": "ENGLISH",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "2/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "102",
                            "subject": "KISWAHILI",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "121",
                            "subject": "MATHEMATICS A",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "3/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "231",
                            "subject": "BIOLOGY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "232",
                            "subject": "PHYSICS",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "233",
                            "subject": "CHEMISTRY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "311",
                            "subject": "HISTORY & GOV",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "312",
                            "subject": "GEOGRAPHY",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "313",
                            "subject": "CHRISTIAN RE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "443",
                            "subject": "AGRICULTURE",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": true
                        },
                        {
                            "code": "451",
                            "subject": "COMPUTER SC.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        },
                        {
                            "code": "565",
                            "subject": "BUSINESS ST.",
                            "marks": {
                                "MID TERM": 0,
                                "END TERM": 0,
                                "mark": 0,
                                "grade": "E"
                            },
                            "points": 1,
                            "rank": "1/6",
                            "remarks": "Average",
                            "instructor": "Ms. Moss",
                            "included": false
                        }
                    ],
                    "total_marks": "0/700",
                    "total_points": "7/84",
                    "stream_position": "3/6",
                    "overal_position": "3/6",
                    "form": "4",
                    "stream": "BANGUI",
                    "image_path": "/student_images/78972.jpg"
                }
            ]
        }

        const addHeader = (doc) => {

            try {
                // Determine the image path - use response logo if available, otherwise default to logo.jpeg
                let logoPath;
                if (
                    response.schoolDetails &&
                    response.schoolDetails[0] &&
                    response.schoolDetails[0].logo &&
                    fs.existsSync(path.join(__dirname, '../images/', response.schoolDetails[0].logo))
                ) {
                    logoPath = path.join(__dirname, '../images/', response.schoolDetails[0].logo);
                } else {
                    logoPath = path.join(__dirname, '../images/', 'logo.jpeg');
                }
            
                // Draw the image
                doc.image(logoPath, 20, 20, { height: 50 });
            
                // Render school details
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

        // Generate QR code for student data
        const generateQRCode = async (studentData) => {
            try {
                const qrData = JSON.stringify({
                    studentId: studentData.id,
                    name: studentData.name,
                    form: response.examDetails.form,
                    term: response.examDetails.term,
                    year: response.examDetails.year,
                    // results : response.studentResults
                });
                
                return await QRCode.toDataURL(qrData, {
                    color: {
                        dark: '#0000FF',  // Blue color
                        light: '#FFFFFF' // White background
                    },
                    margin: 1,
                    scale: 5
                });
            } catch (err) {
                console.error('Error generating QR code:', err);
                return null;
            }
        };

        // Function to convert grade to numerical value
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

        // Generate report for each student
        for (const [index, student] of response.studentResults.entries()) {
            try {
                addHeader(doc);
                
                // Main title
                const pageWidth = doc.page.width;
                const backgroundWidth = pageWidth - 20 - 20;
                const y = 85;

                doc.rect(20, y - 5, backgroundWidth, 20)
                    .fill('#bfdbfe');

                doc.fillColor('black')
                    .font('Times-Bold').fontSize(12)
                   .text(`TERM ${response.examDetails.term} - ${response.examDetails.examname} - ASSESSMENT REPORT FORM ${response.examDetails.year}`.toUpperCase(), { 
                       align: 'center'
                   });
                
                doc.moveDown(0.5);

                // Student info section
                const imageWidth = 60;
                const imageY = 105;

                // Load student image or fallback
                let imagePath = student.student_image
                ? path.resolve(student.student_image)
                : path.join(__dirname, '../images/', 'user_p.jpeg');

                if (!fs.existsSync(imagePath)) {
                imagePath = path.join(__dirname, '../images/', 'user.jpg');
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

                // === RIGHT-SIDE PERFORMANCE GRAPH (NO CONFLICT VARIABLES) ===
                const perfGraphX = textX + 250; // space right of student info
                const perfGraphY = textY;
                const perfGraphWidth = pageWidth - perfGraphX - 40;
                const perfBarHeight = 18;
                const perfBarSpacing = 25;
                const perfMaxGrade = 12;
                const perfUnitWidth = perfGraphWidth / perfMaxGrade;

                // Sample grades (replace with dynamic values)
                // const gradeCurrent = 10; // Current exam (e.g., B+)
                // const gradeRecent = 8;   // Recent exam (e.g., B-)
                const gradeCurrent = gradeToValue(student.ag_grade); // Current exam (e.g., B+)
                const gradeRecent = gradeToValue(student.recent_grade);   // Recent exam (e.g., B-)

                // Vertical line before graph
                doc.moveTo(perfGraphX - 10, perfGraphY)
                .lineTo(perfGraphX - 10, imageY + lineHeight)
                .lineWidth(0.5)
                .strokeColor('grey')
                .stroke();

                // Title above bars
                doc.fontSize(10)
                .font('Times-Roman')
                .fillColor('black')
                .text('Recent performance'.toUpperCase(), perfGraphX, imageY, {
                    width: perfGraphWidth,
                    align: 'left'
                });

                // Horizontal bar - current exam
                doc.fontSize(10)
                    .fillColor('#4caf50')
                    .text(`${student.current_init}`, perfGraphX, imageY + 20, {width : 30})

                doc.rect(perfGraphX + 30, imageY + 15, gradeCurrent * perfUnitWidth, perfBarHeight)
                .fillColor('#4caf50')
                .fill();

                doc.fontSize(10)
                    .fillColor('#2196f3')
                    .text(`${student.recent_init}`, perfGraphX, imageY + 40, {width : 30})

                doc.rect(perfGraphX + 30, imageY + 35, gradeRecent * perfUnitWidth, perfBarHeight)
                .fillColor('#2196f3')
                .fill();


                // === GREEN RECTANGLE SECTION WITH 5 COLUMNS ===
                const rectHeight = 35; // reduced height
                const rectY = imageY + lineHeight + 5; // less space above
                const rectWidth = pageWidth - 40;
                const columnWidth = rectWidth / 5;

                // Centering math
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

                // White divider lines
                for (let i = 1; i < 5; i++) {
                doc.moveTo(20 + (columnWidth * i), rectY)
                    .lineTo(20 + (columnWidth * i), rectY + rectHeight)
                    .lineWidth(0.5)
                    .strokeColor('white')
                    .stroke();
                }

                const tableStartY = rectY + rectHeight + 10;

                // === Dynamic columns setup ===
                const markTypes = new Set();
                student.results.forEach(result => {
                Object.keys(result.marks).forEach(key => {
                    if (key !== 'mark' && key !== 'grade') {
                    markTypes.add(key);
                    }
                });
                });
                const dynamicMarkColumns = Array.from(markTypes);

                // === Combine full column list ===
                const staticColumns = [
                { key: 'code', label: 'Code' },
                { key: 'subject', label: 'Subject' },
                { key: 'mark', label: 'Mark' },
                { key: 'grade', label: 'Grd' },
                { key: 'points', label: 'Pts' },
                { key: 'rank', label: 'Rank' },
                { key: 'remarks', label: 'Remarks' },
                { key: 'instructor', label: 'Instructor' }
                ];

                dynamicMarkColumns.forEach(markType => {
                staticColumns.splice(2, 0, {
                    key: markType.toLowerCase().replace(' ', '_'),
                    label: markType
                });
                });

                // === Base width setup ===
                const totalTableWidth = pageWidth - 40;
                const baseWidths = {
                code: 35,
                subject: 45,
                mark: 40,
                grade: 30,
                points: 30,
                rank: 35,
                remarks: 100,
                instructor: 60
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

                // === Generate dynamic table data ===
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

                // === Table drawing ===
                const startX = 20;
                const startY = tableStartY;
                const headerRowHeight = 30;
                const rowHeight = 20;

                doc.rect(startX, startY, totalTableWidth, headerRowHeight).fill('#BFDBFE');




                // Draw header text
                doc.font('Times-Bold').fontSize(10).fillColor('black');

                let x = startX;
                staticColumns.forEach(col => {
                    const width = baseWidths[col.key];

                    const textHeight = doc.heightOfString(col.label, {width : width -10})
                    const verticalPadding = (headerRowHeight - textHeight) / 2
                    doc.text(col.label, x + 5, startY + verticalPadding, {
                        width : width - 10,
                        align : 'left'
                    });
                    x += width;
                });

                // Draw vertical lines for header
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

                // === Draw rows ===
                let currentY = startY + headerRowHeight; // Changed from rowHeight to headerRowHeight to place data right below header

                tableData.forEach((row, rowIndex) => {
                    let colX = startX;
                    
                    // Draw vertical lines for each column
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

                    // Draw cell content
                    colX = startX;
                    staticColumns.forEach(col => {
                        const key = col.key;
                        const value = row[key] !== undefined ? row[key] : '';
                        const width = baseWidths[key];

                        doc.font('Times-Roman').fontSize(10).fillColor('black');
                        doc.text(String(value), colX + 5, currentY + 5, { width, align: 'left' });

                        colX += width;
                    });

                    // Draw horizontal line between rows
                    doc.moveTo(startX, currentY + rowHeight)
                       .lineTo(startX + totalTableWidth, currentY + rowHeight)
                       .lineWidth(0.5)
                       .strokeColor('#E5E7EB')
                       .stroke();

                    currentY += rowHeight;
                });

                // Draw table border
                doc.rect(startX, startY, totalTableWidth, currentY - startY)
                   .lineWidth(1)
                   .strokeColor('#9CA3AF')
                   .stroke();

                // Add vertical line in the middle of the page below the table
                const verticalLineYStart = currentY + 20;
                const verticalLineHeight = 225;
                const pageMiddleX = pageWidth / 2;

                doc.moveTo(pageMiddleX, verticalLineYStart)
                   .lineTo(pageMiddleX, verticalLineYStart + verticalLineHeight)
                   .lineWidth(1)
                   .strokeColor('#9CA3AF')
                   .stroke();

                // === Add vertical bar graph on the left side ===
                const graphMargin = 10;
                const graphX = 20; // Reduced left margin
                const graphY = verticalLineYStart + 30;
                const graphWidth = pageMiddleX - graphX - graphMargin;
                const graphHeight = 120;

                // Graph title with spacing
                doc.font('Times-Bold').fontSize(11)
                .text('Grade Comparison', graphX, verticalLineYStart + 5);

                // Convert grades to numerical values
                const kcpeValue = gradeToValue(student.kcpe_grade);
                const agValue = gradeToValue(student.ag_grade);
                const maxValue = 12; // Updated max value for scale 1-12

                // Calculate bar dimensions
                const barWidth = 30;
                const spacing = (graphWidth - (2 * barWidth)) / 3;
                const maxBarHeight = graphHeight - 30;

                // Draw Y-axis labels and horizontal lines at 1, 4, 8, 12
                doc.font('Times-Roman').fontSize(8);
                [1, 4, 8, 12].forEach((val) => {
                const yPos = graphY + maxBarHeight - (val / maxValue) * maxBarHeight;

                // Y-axis label
                doc.text(val.toString(), graphX, yPos - 5, {
                    align: 'right',
                    width: 15
                });

                // Horizontal grid line
                doc.moveTo(graphX + 15, yPos) // Start after scale numbers
                    .lineTo(graphX + graphWidth, yPos)
                    .lineWidth(0.2)
                    .strokeColor('#E5E7EB')
                    .stroke();
                });

                // Draw KCPE grade bar
                const kcpeBarHeight = (kcpeValue / maxValue) * maxBarHeight;
                const kcpeBarX = graphX + 25;
                const kcpeBarY = graphY + maxBarHeight - kcpeBarHeight;

                doc.rect(kcpeBarX, kcpeBarY, barWidth, kcpeBarHeight)
                .fill('#3b82f6')
                .stroke('#1d4ed8');

                // KCPE label
                doc.font('Times-Roman').fontSize(8)
                .fillColor('black')
                .text('KCPE', kcpeBarX, graphY + maxBarHeight + 5, {
                    width: barWidth,
                    align: 'center'
                });

                // Draw AG grade bar
                const agBarHeight = (agValue / maxValue) * maxBarHeight;
                const agBarX = kcpeBarX + barWidth + 20;
                const agBarY = graphY + maxBarHeight - agBarHeight;

                doc.rect(agBarX, agBarY, barWidth, agBarHeight)
                .fill('#10b981')
                .stroke('#047857');

                // AG label
                doc.font('Times-Roman').fontSize(8)
                .fillColor('black')
                .text('AG', agBarX, graphY + maxBarHeight + 5, {
                    width: barWidth,
                    align: 'center'
                });

                    // School Dates section - updated alignment
                    const schoolDatesY = verticalLineYStart + maxBarHeight + 50;
                    const schoolDatesHeight = 40;
                    
                    // Background rectangle
                    doc.rect(20, schoolDatesY, pageMiddleX - 30, 20)
                       .fill('#bfdbfe');
                    
                    // Title text
                    doc.fillColor('black')
                       .font('Times-Roman').fontSize(12)
                       .text('School Dates'.toUpperCase(), 25, schoolDatesY + 6);
                    
                    // Dates text - properly aligned below the rectangle
                    doc.font('Times-Roman').fontSize(11)
                       .text(`Closing Date : 30/03/2025`, 25, schoolDatesY + 30)
                       .text(`Opening Date : 28/04/2025`, 25, schoolDatesY + 45);

                    // Paths to signature images (replace these with actual valid paths or null)
                    const classTeacherSignaturePath = student.classTeacherSignature || null;
                    const principalSignaturePath = student.principalSignature || null;

                    // Class Teacher's Remark Section
                    doc.font('Times-Bold').fontSize(11)
                    .fillColor('black')
                    .text('Class Teacher\'s Remark:', pageMiddleX + 10, verticalLineYStart + 10)
                    .moveDown(0.2)
                    .font('Times-Roman').fontSize(11)
                    .fillColor('black')
                    .text(response.schoolDetails[5]?.class_teacher?.say, pageMiddleX + 10, verticalLineYStart + 25, { width: 200 });

                    if (classTeacherSignaturePath) {
                        doc.image(classTeacherSignaturePath, pageMiddleX + 10 + 200, verticalLineYStart + 20, {
                            width: (pageMiddleX * 2 - 30) - (pageMiddleX + 10 + 200),
                            height: 30
                        });
                    } else {
                        doc.moveTo(pageMiddleX + 10 + 200, verticalLineYStart + 50)
                        .lineTo(pageMiddleX * 2 - 30, verticalLineYStart + 50)
                        .stroke('black');
                    }

                    // Principal's Remark Section
                    doc.font('Times-Bold').fontSize(11)
                    .fillColor('black')
                    .text('Principal\'s Remark:', pageMiddleX + 10, verticalLineYStart + 80)
                    .moveDown(0.2)
                    .font('Times-Roman').fontSize(11)
                    .fillColor('black')
                    .text(response.schoolDetails[6]?.principal?.say, pageMiddleX + 10, verticalLineYStart + 95, { width: 200 });

                    if (principalSignaturePath) {
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
                    .text('Parent\'s Signature :', pageMiddleX + 10, verticalLineYStart + 140, {width : 200})
                    .text('_____________',pageMiddleX + 10 + 200, verticalLineYStart + 140, {width : (pageMiddleX - 30) - 200})

                // Generate and add QR code below parent's signature on the right
                const qrCode = await generateQRCode(student);
                if (qrCode) {
                    const qrX = pageMiddleX + 10;
                    const qrY = verticalLineYStart + 160;
                    const qrSize = 60;
                    
                    // Add QR code with blue border
                    doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4)
                       .fill('#0000FF');
                    
                    doc.image(qrCode, qrX, qrY, {width: qrSize, height: qrSize});
                    
                    // Add text below QR code
                    doc.font('Times-Bold').fontSize(8)
                       .fillColor('#0000FF')
                       .text('STUDENT INFO', qrX, qrY + qrSize + 5, {
                           width: qrSize,
                           align: 'center'
                       });
                    doc.font('Times-Bold').fontSize(12)
                        .text('Scan the QR Code for a unique code to authenticate results', pageMiddleX + 20 + qrSize, verticalLineYStart + 180, {width : (pageMiddleX - 40) - qrSize})
                }

                doc.moveDown(10);

                // Add new page for next student if needed
                if (index < response.studentResults.length - 1) {
                    doc.addPage();
                }
            } catch (err) {
                console.error(`Error generating report for student ${student.id}:`, err);
                throw err;
            }
        }

        // Finalize the PDF
        doc.end();
    } catch (err) {
        console.error('PDF generation failed:', err);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF',
                error: err.message
            });
        }
    }
});

export default router;
