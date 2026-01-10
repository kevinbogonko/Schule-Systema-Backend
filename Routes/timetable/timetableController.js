import express from 'express'
import {
  addDayCluster,
  getDayClusters,
  getDayCluster,
  updateDayCluster,
  deleteDayCluster,
} from "../../controllers/timetable/dayClusterCRUD.js";
import {
  getTimeSlots,
  updateTimeSlots,
} from "../../controllers/timetable/timeSlotsController.js";
import {
  getSubjectConfigs,
  updateSubjectConfig,
  getAllSubjectConfigs,
  configureTTLessons,
  getTimeTables,
} from "../../controllers/timetable/subjectConfig.js";
import { generateMasterTTPDF } from "../../controllers/timetable/masterTT.js";
import { generateTeacherTTPDF } from "../../controllers/timetable/teacherTT.js";
import { TTPDFData } from "../../controllers/timetable/ttPDFData.js";

const router = express.Router()

// Day Cluster Registration Endpoint
router.post("/adddaycluster", addDayCluster);

// All Day Cluster Fetch Endpoint
router.post("/getdayclusters", getDayClusters);

// Day Cluster Fetch Endpoint
router.post("/getdaycluster", getDayCluster);

// Day Cluster Update Endpoint
router.put("/updatedaycluster/:id", updateDayCluster);

// Day Cluster Delete Endpoint
router.post("/deletedaycluster/:id", deleteDayCluster);


// TIMESLOTS

// Timeslots Fetch Endpoint
router.post("/gettimeslots", getTimeSlots);

// Timeslots Update Endpoint
router.post("/updatetimeslots", updateTimeSlots);


// SUBJECT CONFIGS

// SubjectConfig Fetch Endpoint
router.post("/getsubjconfig", getSubjectConfigs);

// Get all subject config
router.post("/getallsubjconfig", getAllSubjectConfigs);

// SubjectConfig Update Endpoint
router.post("/savesubjconfig", updateSubjectConfig);


// COMMIT REFINED LESSONS SAVE/UPDATE READY FOR REPORT GENERATION
router.post("/committimetable", configureTTLessons);

// COMMIT REFINED LESSONS SAVE/UPDATE READY FOR REPORT GENERATION
router.post("/gettimetables", getTimeTables);
// router.post("/ttdata", TTPDFData);


// TIMETABLE REPORT PDF
// Master TT
// router.get("/mastertt", generateMasterTTPDF);
// router.post("/mastertt", TTPDFData);

// Router handler
router.post("/mastertt", async (req, res, next) => {
  try {
    // 1. Generate report data
    const ttPDFData = await TTPDFData(req);

    // 2. Wrap PDF generation in a Promise to await the buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      generateMasterTTPDF(ttPDFData, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });

    // 3. Send PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=master_timetable.pdf",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Teacher TT
// router.get("/teachertt", generateTeacherTTPDF);

router.post("/teachertt", async (req, res, next) => {
  try {
    const ttPDFData = await TTPDFData(req);
    
    const pdfBuffer = await new Promise((resolve, reject) => {
      generateTeacherTTPDF(ttPDFData, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=master_timetable.pdf",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


export default router