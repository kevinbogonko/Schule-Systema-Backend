import express from 'express'
import {
  createTenantDb,
  deleteTenant,
  getTenants,
  getTenant,
  updateTenant,
} from "../../controllers/tenant/tenants.controller.js";

const router = express.Router()

// Tenant and DB Registration Endpoint
router.post("/addtenant", createTenantDb);

// Get Tenants
router.post("/gettenants", getTenants);

// Get Tenant
router.post("/gettenant", getTenant);

// Update Tenant
router.post("/updatetenant", updateTenant);

// Delete Tenant and DB
router.post("/deletetenant/:tenantId", deleteTenant);

export default router