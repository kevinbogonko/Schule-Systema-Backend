import jwt from 'jsonwebtoken'
import { createError } from './ErrorHandler.js'

// Middleware for Protected Routes
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
        
    if(!token) return next(createError(401, 'You are not authenticated - Please log in again'))
  
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, (err, user) => {
      if (!err) {
        req.user = user
        return next()
      }
      
      // Specific expired token response
      if (err.name === 'TokenExpiredError') {
        return next(createError(401, 'Authentication token expired'))
      }
  
      // Any other JWT error
      return res.status(403).json({
        status: 403,
        message: 'Forbiden Access!'
      })
    })
  }