import jwt from "jsonwebtoken";
import { createError } from "./ErrorHandler.js";
import pool from "../config/db_connection.js"

// Helper to verify if token is revoked
const isTokenRevoked = async (jti) => {
  const { rows } = await pool.query(
    "SELECT 1 FROM revoked_tokens WHERE token_id = $1 LIMIT 1",
    [jti]
  );
  return rows.length > 0;
};

// Middleware for protected routes
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Missing or invalid authorization header"));
    }

    const token = authHeader.split(" ")[1];

    // Decode and verify JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);

    // Check if token is revoked
    const revoked = await isTokenRevoked(decoded.jti);
    if (revoked) {
      return next(createError(401, "This token has been revoked"));
    }

    req.user = decoded; // attach user info
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createError(401, "Authentication token expired"));
    }
    return next(createError(403, "Forbidden access - Invalid token"));
  }
};
