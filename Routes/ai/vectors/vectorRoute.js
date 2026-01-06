import express from "express";
import {
  createCollection,
  upsertCollection,
  searchCollection,
  searchWithFilters,
  deletePoints,
  listCollections,
  deleteCollection,
} from "../../../controllers/ai/vectors/vectorDbController.js";

const router = express.Router();

router.post("/create_collection", createCollection);
router.post("/upsert", upsertCollection);
router.post("/search", searchCollection);
router.post("/search_filter", searchWithFilters);
router.post("/delete", deletePoints);
router.get("/collections", listCollections);
router.delete("/collection/:name", deleteCollection);


export default router;