
import express from 'express'
import { getActiveSubjects } from "../../controllers/subjects/subjectsController.js";

const router = express.Router()

// Endpoint to add Teacher
router.post("/getsubjects", getActiveSubjects);


export default router