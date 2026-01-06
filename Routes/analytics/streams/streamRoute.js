import express from 'express'
import {
  getStream,
  getAllStreams,
  addStream,
  updateStream,
  deleteStream,
  getAllStreamNames,
  getStreamName,
  addGlobalStream,
  updateGlobalStream,
  deleteGlobalStream,
  getAllFormStreams,
} from "../../../controllers/analytics/streams/crudStreamController.js";

const router = express.Router()

// Endpoint to add Stream
router.post("/addstream", addStream)

// Endpoint to get all Stream
router.post("/getstreams", getAllStreams)

// Endpoint to get all Stream
router.post("/getformstreams", getAllFormStreams);

// Endpoint to get Stream
router.post("/getstream", getStream)

// Endpoint to update Stream
router.put("/updatestream/:id", updateStream)

// Endpoint to delete Stream
router.post("/deletestream/:id", deleteStream)




// Higher GET ALL Streams
router.get("/getstreamnames", getAllStreamNames);

// Higher GET ONE Stream
router.post("/getstreamname", getStreamName);

// Higher add Stream
router.post("/addstreamname", addGlobalStream);

// Higher update Stream
router.put("/updatestreamname/:id", updateGlobalStream);

// Higher delete Stream
router.post("/deletestreamname/:id", deleteGlobalStream);


export default router