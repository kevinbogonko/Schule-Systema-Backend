import express from 'express'
import { DashboardData } from "../../../controllers/analytics/dashboard/dashboard.js";

const router = express.Router()

// Endpoint to get dashboard data
router.post("/dashboarddata", DashboardData);





export default router