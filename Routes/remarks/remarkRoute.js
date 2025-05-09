import express from 'express'
import {
  getAllRemarks,
  getRemark,
  updateRemark,
} from "../../controllers/remarks/remarkController.js";

const router = express.Router()

// Endpoint to get Remarks
router.post("/getremarks", getAllRemarks);

// Endpoint to get Remark
router.post("/getremark", getRemark);

// Endpoint to update remark
router.put("/updateremark/:id", updateRemark);




export default router