import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import userRoutes from "./Routes/userRoutes.js"
import authRoute from "./Routes/authRoute/authRoute.js"
import subjectRoute from "./Routes/subjects/subjectsRoute.js"
import smsRoute from "./Routes/smsRoute.js"
import examRoute from "./Routes/exams/examRoute.js"
import gradingRoute from "./Routes/exams/gradingRoute.js"
import studentRoute from "./Routes/studentRoute.js"
import studentReportRoute from "./Routes/studentReportRoute.js"

import teacherRoute from "./Routes/teachers/teacherRoute.js"
import streamRoute from "./Routes/streams/streamRoute.js"
import remarkRoute from "./Routes/remarks/remarkRoute.js"
import particularRoute from "./Routes/particulars/particularRoute.js"

import report from "./Routes/reports/reportform/testPdf.js"
import marksheetReport from "./Routes/reports/marksheet/marksheetPdfRoute.js"
import marklistReport from "./Routes/reports/marklist/marklistRoute.js"


import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'


import uploadRoute from "./Routes/upload/uploadRoute.js"
import timetableRoute from "./Routes/timetable/timetableController.js"


import SMSResRoute from "./Routes/sms/resultSMSRoute.js"




const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express Server Instance
const app = express()

// Configure the dotenv
dotenv.config()

// Port
const PORT = process.env.PORT || 5004

// Middlewares
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({
    extended : true
}))

// Static files
app.use('/images', express.static(path.join(__dirname, 'public', 'images')))


// Routes
app.use("/api/users", userRoutes)
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


app.use("/api/teacher/", teacherRoute)
app.use("/api/stream/", streamRoute)
app.use("/api/remark/", remarkRoute);
app.use("/api/particular/", particularRoute); // Not complete


app.use("/api/upload/", uploadRoute); // Not complete
app.use("/api/timetable/", timetableRoute); // Not complete


app.use("/api/sms/", SMSResRoute);


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
app.listen(PORT, () => {
    console.log(`Server up and listening on http://localhost:${PORT}`)
})