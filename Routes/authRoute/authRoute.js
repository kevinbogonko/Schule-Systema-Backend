import express from 'express'
import { verifyToken } from '../../utils/verifyToken.js'
import { registerUser, userLogin, refreshAccessToken, userLogout } from '../../controllers/auth/authController.js'

const router = express.Router()

// User Registration Endpoint
router.post("/register", registerUser)

// Login Endpoint
router.post("/login", userLogin)

// Login Endpoint
router.get("/refreshAccessToken", refreshAccessToken)

// Logout Endpoint
router.post("/logout", verifyToken, userLogout)

router.get("/test", verifyToken, (req, res, next) => {

    res.send("There")
    next()
})

export default router