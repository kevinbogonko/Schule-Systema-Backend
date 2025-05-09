import express from 'express'
// import { verifyToken } from '../utils/verifyToken.js'
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/userController.js'

// Initialising Router Instance
const router = express.Router()

// Routes
// Create User
router.post("/", createUser)

// Fetch all Users
router.get("/", getUsers)

// Get a single user
router.get("/:id", getUser)

// Update User
router.put("/:id", updateUser)

// Delete User
router.delete("/:id", deleteUser)

export default router