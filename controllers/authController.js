import bycrypt from 'bcrypt'
import pool from '../config/db_connection.js'
import jwt from 'jsonwebtoken'
import { createError } from '../utils/ErrorHandler.js'
import loginLimiter from '../utils/rateLimiter.js'

// Register User Controller
export const registerUser = async (req, res, next) =>{
    try {
        const username = req.body.username 
        const password = req.body.password
        const salt = bycrypt.genSaltSync(10)
        const hash = bycrypt.hashSync(password, salt)

        // Check if username already exists in Table
        const result = await pool.query("SELECT * FROM auth WHERE username = $1", [username])
        if(result.rows.length > 0) return next(createError(400, 'Provided username already exists'))

        // Add user into Table
        const response = await pool.query(
            'INSERT INTO auth (username, password) VALUES ($1, $2) RETURNING *',
            [username, hash]
        )
        res.status(201).json(response.rows[0])
        
    } catch (err) {
        next(err)
    }
}

// User Login Controller
export const userLogin = async (req, res, next) => {

    const ip = req.ip
    const { username, password } = req.body
  
    try {
      await loginLimiter.consume(ip)
  
      const result = await pool.query(
        "SELECT * FROM auth WHERE username = $1", 
        [username]
      )
  
      if (result.rows.length === 0) {
        return next(createError(401, 'User record does not exist in database'))
      }
  
      const user = result.rows[0]
      const isPasswordCorrect = await bycrypt.compare(password, user.password)
  
      if (!isPasswordCorrect) {
        return next(createError(401, 'Invalid credentials'))
      }
  
      const accessToken = jwt.sign(
        { user: { id: user.id, username: user.username } },
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: '3m' }
      )
  
      const refreshToken = jwt.sign(
        { user: { id: user.id, username: user.username } },
        process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: '3m' }
      )
  
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: 'lax'
      })
  
      res.status(200).json({
        access_token : accessToken,
        tokenType : 'Bearer',
        status: 200,
        message: 'Login success' + accessToken + " Refresh - : " + refreshToken
      })
  
    } catch (err) {
      if (err instanceof Error && err.msBeforeNext) {
        const retryAfter = Math.ceil((err.msBeforeNext / 1000) / 60)
        return next(createError(409, `Too many attempts. Try again in ${retryAfter} minutes.`))
      }
      const retryAfter = Math.ceil((err.msBeforeNext / 1000) / 60)
      return next(createError(409, `Too many attempts. Try again in ${retryAfter} minutes.`))
    }
}

// Refresh Token Controller
export const refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies.refresh_token
  
    if (!refreshToken) {
      return next(createError(401, 'Not authenticated - No refresh token'))
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY)
  
      const newAccessToken = jwt.sign(
        {
          userId: decoded.userId,
          username: decoded.username,
          jti: crypto.randomUUID(),
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: '1m' }
      )
  
      res.json({
        accessToken: newAccessToken,
        expiresIn: 1 * 60 * 1000,
        tokenType: 'Bearer'
      })
  
    } catch (err) {

      res.clearCookie('refresh_token')
      
      if (err.name === 'TokenExpiredError') {
        return next(createError(401, 'Session expired - Please log in again'))
      }
      next(createError(403, 'Invalid token - Access denied'))
    }
}

// Logout Controller
export const userLogout = async (req, res, next) =>{
    // console.log(res.headers)
    try {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            sameSite: 'lax'
        })

        // const authHeader = req.headers['authorization']
        // const token = authHeader && authHeader.split(' ')[1]

        const cookies = req.headers.cookie || ''
        if(cookies.includes('refresh_token')) return next(createError(500, 'Failed to clear refresh token'))

        console.log(req.headers)

        res.status(200).json({
            status : 200,
            message :'Logout successful'
        })
    } catch (err) {
       next(err) 
    }
}