import bcrypt from 'bcrypt'
import pool from '../../config/db_connection.js'
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from "uuid"
import {validationResult} from "express-validator"
import { createError } from '../../utils/ErrorHandler.js'
import loginLimiter from '../../utils/rateLimiter.js'
import {sendBulkSMS} from "../sms/standardSMSController.js"

// Register User Controller
export const registerUser = async (req, res, next) => {
  const { user_id, username, password, role } = req.body;

  // Input validation
  if (!user_id || !username || !password ||!role) {
    return next(createError(400, "Username and password are required"));
  }

  if (password.length < 8) {
    return next(createError(400, "Password must be at least 8 characters"));
  }

  try {
    // Check if username exists
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userCheck.rows.length > 0) {
      return next(createError(409, "Username already exists"));
    }

    // Hash password asynchronously
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert user within a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        "INSERT INTO users (username, password, user_id, role) VALUES ($1, $2, $3, $4) RETURNING id, username",
        [username, hash, user_id, role]
      );

      await client.query("COMMIT");

      // Return only non-sensitive data
      res.status(201).json({
        id: result.rows[0].id,
        username: result.rows[0].username,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(createError(500, "Registration failed"));
  }
};

// User Login Controller
export const userLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const ip = req.ip;
  const userAgent = req.get("User-Agent") || "unknown";
  const { username, password } = req.body;

  try {
    await loginLimiter.consume(ip);

    const newTokenVersion = uuidv4();

    const { rows } = await pool.query(
      `UPDATE users
       SET token_version = $1
       WHERE username = $2
       RETURNING id, user_id, username, password, role, is_active, token_version`,
      [newTokenVersion, username]
    );

    if (rows.length === 0) {
      await bcrypt.compare(
        password,
        "$2a$10$fakehashfor.timing.attack.prevention"
      );
      return next(createError(401, "Invalid credentials"));
    }

    const user = rows[0];

    if (!user.is_active) {
      return next(createError(403, "Account is disabled"));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(401, "Invalid credentials"));
    }

    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          user_id: user.user_id,
          username: user.username,
          role: user.role,
        },
        jti: accessJti,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "15m",
        issuer: process.env.BACKEND_BASE_URL,
        audience: process.env.FRONTEND_BASE_URL,
      }
    );

    const refreshToken = jwt.sign(
      {
        user: {
          id: user.id,
          user_id: user.user_id,
        },
        tokenVersion: newTokenVersion,
        jti: refreshJti,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
        issuer: process.env.BACKEND_BASE_URL,
        audience: process.env.FRONTEND_BASE_URL,
      }
    );

    const tokenId = refreshJti; // Use the refresh jti as token_id
    await pool.query(
      `INSERT INTO refresh_tokens
       (token_id, user_id, token, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + interval '7 days')`,
      [tokenId, user.id, await bcrypt.hash(refreshToken, 12), userAgent, ip]
    );

    const csrfToken = uuidv4();

    // Set cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // ✅ 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 days
    });

    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
      csrf_token: csrfToken,
    });
  } catch (err) {
    if (err instanceof Error && err.msBeforeNext) {
      res.set("Retry-After", Math.ceil(err.msBeforeNext / 1000).toString());
      return next(createError(429, "Too many requests"));
    }
    return next(createError(500, "Authentication failed"));
  }
};

// Refresh Token Controller
export const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return next(createError(401, "Authentication required"));
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );
  } catch (err) {
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

    if (err.name === "TokenExpiredError" && err.expiredAt) {
      await pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_id = $1",
        [decoded?.jti] // Optional chaining in case of failure
      );
      return next(createError(401, "Session expired"));
    }

    return next(createError(403, "Invalid token"));
  }

  try {
    const userQuery = await pool.query(
      `SELECT id, user_id, username, role, token_version FROM users WHERE id = $1`,
      [decoded.user.id]
    );

    if (userQuery.rows.length === 0) {
      res.clearCookie("refresh_token");
      res.clearCookie("access_token");
      return next(createError(403, "Invalid token"));
    }

    const user = userQuery.rows[0];

    if (decoded.tokenVersion !== user.token_version) {
      res.clearCookie("refresh_token");
      res.clearCookie("access_token");
      return next(createError(403, "Invalid token"));
    }

    const tokenRecord = await pool.query(
      `SELECT revoked_at FROM refresh_tokens
       WHERE token_id = $1 AND user_id = $2`,
      [decoded.jti, decoded.user.id]
    );

    if (!tokenRecord.rows.length || tokenRecord.rows[0].revoked_at) {
      res.clearCookie("refresh_token");
      res.clearCookie("access_token");
      return next(createError(403, "Invalid token"));
    }

    const newAccessToken = jwt.sign(
      {
        user: {
          id: user.id,
          user_id: user.user_id,
          username: user.username,
          role: user.role,
        },
        jti: uuidv4(),
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "15m",
        issuer: process.env.BACKEND_BASE_URL,
        audience: process.env.FRONTEND_BASE_URL,
      }
    );

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path : "/",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    return next(createError(500, "Token refresh failed"));
  }
};

// Get LoggedIn user
export const getLoggedInUser = async (req, res, next) => {
  try {
    const userId = req.user?.user?.id; // Comes from decoded JWT payload

    if (!userId) {
      return next(createError(401, "Unauthorized access"));
    }

    const { rows } = await pool.query(
      `SELECT id, user_id, username, role, is_active, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return next(createError(404, "User not found"));
    }

    const user = rows[0];

    if (!user.is_active) {
      return next(createError(403, "Account is disabled"));
    }

    res.status(200).json({
      id: user.id,
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    });
  } catch (err) {
    console.log(err)
    next(createError(500, "Failed to fetch user info"));
  }
};

// Helper: revoke token family recursively
const revokeTokenFamily = async (tokenId) => {
    await pool.query(
        `WITH RECURSIVE token_chain AS (
            SELECT token_id FROM refresh_tokens WHERE token_id = $1
            UNION
            SELECT t.token_id FROM refresh_tokens t
            JOIN token_chain tc ON t.replaced_by = tc.token_id
        )
        UPDATE refresh_tokens SET revoked_at = NOW() 
        WHERE token_id IN (SELECT token_id FROM token_chain)`,
        [tokenId]
    );
};

// Logout Controller
export const userLogout = async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;
  const accessToken = req.cookies.access_token;

  try {
    await pool.query("BEGIN");

    // 1. Revoke refresh token (and its replacements)
    if (refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_TOKEN_SECRET_KEY
        );
        await revokeTokenFamily(decodedRefresh.jti);
      } catch (err) {
        console.warn("Invalid refresh token during logout:", err.message);
      }
    }

    // 2. Blacklist access token
    if (accessToken) {
      try {
        const decodedAccess = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
          { ignoreExpiration: true }
        );
        await pool.query(
          "INSERT INTO revoked_tokens (token_id, user_id, expires_at) VALUES ($1, $2, $3)",
          [
            decodedAccess.jti,
            decodedAccess.user.id,
            new Date(decodedAccess.exp * 1000),
          ]
        );
      } catch (err) {
        console.warn("Invalid access token during logout:", err.message);
      }
    }

    await pool.query("COMMIT");

    // Cookie clearing options - consistent for all cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      // domain: process.env.COOKIE_DOMAIN || undefined, // Add if using cross-domain cookies
      expires: new Date(0), // Immediately expire
    };

    // Clear all cookies
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    // XSRF-TOKEN has slightly different options
    res.clearCookie("XSRF-TOKEN", {
      ...cookieOptions,
      httpOnly: false, // XSRF needs to be readable by JS
    });

    // 4. Send response
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
      clearClientTokens: true,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    next(createError(500, "Logout failed"));
  }
};

// Request Password Reset OTP
export const requestPassResetOTP = async (req, res, next) => {
  try {
    // Validate request body
    const { username } = req.body;
    if (!username) {
      return next(createError(400, "Username is required"));
    }

    // Get user details including role
    const userQuery = await pool.query(
      `SELECT u.user_id, u.role 
       FROM users u 
       WHERE u.username = $1`,
      [username]
    );

    if (userQuery.rowCount === 0) {
      return next(createError(404, "User not found"));
    }

    const { user_id, role } = userQuery.rows[0];
    let phone;

    // Determine phone number based on user role
    switch (role) {
      case "student":
        const studentQuery = await pool.query(
          "SELECT phone FROM students WHERE id = $1",
          [user_id]
        );
        if (studentQuery.rowCount > 0) {
          phone = studentQuery.rows[0].phone;
        }
        break;

      case "teacher":
      case "staff":
        const staffQuery = await pool.query(
          "SELECT phone FROM staff WHERE id = $1",
          [user_id]
        );
        if (staffQuery.rowCount > 0) {
          phone = staffQuery.rows[0].phone;
        }
        break;

      case "admin":
      case "particular":
        const particularQuery = await pool.query(
          "SELECT phone FROM particulars WHERE id = $1",
          [user_id]
        );
        if (particularQuery.rowCount > 0) {
          phone = particularQuery.rows[0].phone;
        }
        break;

      default:
        return next(createError(400, "Invalid user role"));
    }

    if (!phone) {
      return next(createError(404, "Phone number not found for user"));
    }

    // Generate OTP and expiry time
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiry = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    // Update user record with OTP
    await pool.query(
      `UPDATE users 
       SET reset_otp = $1, reset_otp_expiry = $2 
       WHERE username = $3`,
      [otp, expiry, username]
    );

    const smslist = [{
      partnerID: process.env.TEXTSMS_PARTNER_ID,
      apikey: process.env.TEXTSMS_API_KEY,
      pass_type: "plain",
      clientsmsid:
        user_id.toString() ||
        `sms-${Math.random().toString(36).slice(2, 10)}`, 
      mobile: phone,
      message: `Your password reset OTP is : ${otp}. It expires in 5 minutes.`,
      shortcode: process.env.TEXTSMS_SHORTCODE || "TextSMS",
    }];

    const payload = {
      count: 1,
      smslist,
      unival: "passresetsms",
    };

    req.body = payload;
    await sendBulkSMS(req, res, next);
    // Log successful OTP sending (without exposing sensitive data)
    // console.log(`OTP sent to user ${username}`);

    // res.status(200).json(`OTP sent successfully to registered phone number ${phone}`);
  } catch (error) {
    next(error);
  }
};

// Verify Password Reset OTP
export const verifyPassResetOTP = async (req, res, next) => {
  try {
    // 1. Input validation
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return next(
        createError(400, "Username, OTP and new password are required")
      );
    }

    if (newPassword.length < 8) {
      return next(
        createError(400, "Password must be at least 8 characters long")
      );
    }

    // 2. Check OTP validity
    const { rows } = await pool.query(
      `SELECT user_id, reset_otp_expiry 
       FROM users 
       WHERE username = $1 
       AND reset_otp = $2 
       AND reset_otp_expiry > NOW()`,
      [username, otp]
    );

    if (rows.length === 0) {
      return next(createError(400, "Invalid or expired OTP"));
    }

    // 3. Hash the new password
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update password and clear OTP fields
    const { rowCount } = await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_otp = NULL, 
           reset_otp_expiry = NULL,
           updated_at = NOW()
       WHERE username = $2
       RETURNING user_id`,
      [hash, username]
    );

    if (rowCount === 0) {
      return next(createError(500, "Failed to update password"));
    }

    // 5. Success response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        userId: rows[0].user_id,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    // 6. Error handling
    console.error("Error in verifyResetOTP:", error);
    next(createError(500, "Internal server error"));
  }
};