import express from 'express'
import { generateSchoolTimetable } from "../../controllers/timetable/generateTimeTableController.js";
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
import { getSubjectConfigs } from "../../controllers/timetable/subjectConfig.js";
import { generateMasterTTPDF } from "../../controllers/timetable/masterTT.js";

const router = express.Router()

//  Endpoint
router.get("/timetable", generateSchoolTimetable);

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

// TIMETABLE REPORT PDF
router.post("/mastertt", generateMasterTTPDF);


export default router