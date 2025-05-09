import express from 'express'
import { getStream, getAllStreams, addStream, updateStream, deleteStream } from '../../controllers/streams/crudStreamController.js'

const router = express.Router()

// Endpoint to add Stream
router.post("/addstream", addStream)

// Endpoint to get all Stream
router.post("/getstreams", getAllStreams)

// Endpoint to get Stream
router.post("/getstream", getStream)

// Endpoint to update Stream
router.put("/updatestream/:id", updateStream)

// Endpoint to delete Stream
router.post("/deletestream/:id", deleteStream)



export default router