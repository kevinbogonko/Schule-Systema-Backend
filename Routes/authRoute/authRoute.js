import express from 'express'
import { verifyToken } from '../../utils/verifyToken.js'
import { registerUser, userLogin, refreshAccessToken, userLogout, getLoggedInUser } from '../../controllers/auth/authController.js'

const router = express.Router()

// User Registration Endpoint
router.post("/register", registerUser)

// Login Endpoint
router.post("/login", userLogin)

// Refresh Access Token Endpoint
router.get("/refreshAccessToken", refreshAccessToken)

// Decode user Endpoint
router.get("/getloggedinuser", verifyToken, getLoggedInUser);

// Logout Endpoint
router.post("/logout", verifyToken, userLogout)

router.get("/test", verifyToken, (req, res, next) => { // This was for testing, will be removed

    res.send("There")
    next()
})

export default router