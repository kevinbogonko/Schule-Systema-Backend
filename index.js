import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import dashboardRoute from "./Routes/analytics/dashboard/dashboardRoute.js";
import authRoute from "./Routes/analytics/authRoute/authRoute.js";
import subjectRoute from "./Routes/analytics/subjects/subjectsRoute.js";
import smsRoute from "./Routes/analytics/smsRoute.js";
import examRoute from "./Routes/analytics/exams/examRoute.js";
import gradingRoute from "./Routes/analytics/exams/gradingRoute.js";
import studentRoute from "./Routes/analytics/studentRoute.js";
import studentReportRoute from "./Routes/analytics/studentReportRoute.js";

import teacherRoute from "./Routes/analytics/teachers/teacherRoute.js";
import streamRoute from "./Routes/analytics/streams/streamRoute.js";
import remarkRoute from "./Routes/analytics/remarks/remarkRoute.js";
import particularRoute from "./Routes/analytics/particulars/particularRoute.js";

import report from "./Routes/analytics/reports/reportform/testPdf.js";
import marksheetReport from "./Routes/analytics/reports/marksheet/marksheetPdfRoute.js";
import marklistReport from "./Routes/analytics/reports/marklist/marklistRoute.js";
import markanalysisReport from "./Routes/analytics/reports/analysis/markanalysisRoute.js";

import uploadRoute from "./Routes/analytics/upload/uploadRoute.js";
// SMS
import SMSResRoute from "./Routes/analytics/sms/resultSMSRoute.js";

import SystemLevelsRoute from "./Routes/SystemLevelRoute.js";


// TIMETABLE
import timetableRoute from "./Routes/timetable/timetableController.js"

// AI
import vectorRoute from "./Routes/ai/vectors/vectorRoute.js"
import ingestionRoute from "./Routes/ai/ingestion/ingestionRoute.js";
import curriculumRoute from "./Routes/ai/curriculum/curriculumRoute.js";

// TENANT
import tenantRoute from "./Routes/tenant/tenant.route.js"


// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express Server Instance
const app = express()

// Configure the dotenv
dotenv.config()

// Port
const PORT = process.env.PORT || 5001

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL || "http://localhost",
    credentials: true,
    exposedHeaders: ['X-XSRF-TOKEN']
  })
); // Comment this out in production
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({
    extended : true
}))
app.disable("x-powered-by")


// Serve static files from the React app build folder
// app.use(express.static(path.join(__dirname, "dist")));

// Static files
app.use('/images', express.static(path.join(__dirname, 'public', 'images')))

// Handle favicon requests explicitly
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authRoute)
app.use("/api/auth", smsRoute)
app.use("/api/subject", subjectRoute);
app.use("/api/exam", examRoute)
app.use("/api/grading", gradingRoute)
app.use("/api/student", studentRoute)
app.use("/api/studentreport", studentReportRoute)

app.use("/api/pdfr", report) // Not complete
app.use("/api/report", marksheetReport); // Not complete FOR MARKSHEET
app.use("/api/report", marklistReport); // Not complete FOR MARKSHEET
app.use("/api/report", markanalysisReport); // Not complete FOR ANALYSIS

app.use("/api/teacher/", teacherRoute)
app.use("/api/stream/", streamRoute)
app.use("/api/remark/", remarkRoute);
app.use("/api/particular/", particularRoute); // Not complete

app.use("/api/upload/", uploadRoute); // Not complete
app.use("/api/timetable/", timetableRoute); // Not complete

app.use("/api/sms/", SMSResRoute);

app.use("/api/system/", SystemLevelsRoute);

// AI
app.use("/api/vector", vectorRoute)
app.use("/api/ingest", ingestionRoute)
app.use("/api/curriculum", curriculumRoute)

// TENANTS
app.use("/api/tenant", tenantRoute);

// Test
app.get("/api/test", (req, res) => {
    res.json("Working out ...")
})

// Handle client-side routing
// app.get('*', (req, res, next) => {
//     if(req.path.startsWith('/api')){
//         return next()
//     }else{
//         res.sendFile(path.join(__dirname, "dist", "index.html"));
//     }
// })

// Handle 404 for API route only
app.use('/api/*', (req, res) => {
    res.status(404).json({message : "API endpoint not found"})
})


// Error Handling Middleware
app.use((err, req, res, next) => {

    if(err.code === 'LIMIT_FILE_SIZE'){
        return res.status(413).json({
            error: 'File too large. Maximum size is 5MB'
        })
    }

    if(err.code === 'LIMIT_FILE_COUNT'){
        return res.status(413).json({
            error: 'Too many files. Maximum is 5'
        })
    }

    if(err.code === 'Invalid file type. Only images are allowed.'){
        return res.status(415).json({
            error: err.message
        })
    }

    return res.status(500).json({
        status : err.status,
        message : err.message
    })
})

// Port listening
app.listen(PORT,'0.0.0.0', () => {
    console.log(
      `Server up and listening on http://localhost:${PORT}`
    );
})