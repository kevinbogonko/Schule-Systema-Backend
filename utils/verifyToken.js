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
    // Only use header token for API calls
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.access_token;

    if (!token) {
      return next(createError(401, "Missing authorization token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);

    // Verify CSRF token for non-GET requests
    if (req.method !== "GET") {
      const csrfToken = req.headers["x-xsrf-token"];
      if (!csrfToken || csrfToken !== req.cookies["XSRF-TOKEN"]) {
        return next(createError(403, "Invalid CSRF token"));
      }
    }

    const revoked = await isTokenRevoked(decoded.jti);
    if (revoked) return next(createError(401, "Token revoked"));

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createError(401, "Authentication token expired"));
    }
    return next(createError(403, "Forbidden access - Invalid token"));
  }
};
