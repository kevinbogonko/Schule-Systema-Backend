import bcrypt from 'bcrypt'
import pool from '../../config/db_connection.js'
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from "uuid"
import {validationResult} from "express-validator"
import { createError } from '../../utils/ErrorHandler.js'
import loginLimiter from '../../utils/rateLimiter.js'

// Register User Controller
export const registerUser = async (req, res, next) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
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
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
        [username, hash]
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
// export const userLogin = async (req, res, next) => {

//     const ip = req.ip
//     const { username, password } = req.body
  
//     try {
//       await loginLimiter.consume(ip)
  
//       const result = await pool.query(
//         "SELECT * FROM auth WHERE username = $1", 
//         [username]
//       )
  
//       if (result.rows.length === 0) {
//         return next(createError(401, 'User record does not exist in database'))
//       }
  
//       const user = result.rows[0]
//       const isPasswordCorrect = await bcrypt.compare(password, user.password)
  
//       if (!isPasswordCorrect) {
//         return next(createError(401, 'Invalid credentials'))
//       }
  
//       const accessToken = jwt.sign(
//         { user: { id: user.id, username: user.username } },
//         process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
//         { expiresIn: '3m' }
//       )
  
//       const refreshToken = jwt.sign(
//         { user: { id: user.id, username: user.username } },
//         process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
//         { expiresIn: '3m' }
//       )
  
//       res.cookie("refresh_token", refreshToken, {
//         httpOnly: true,
//         sameSite: 'lax'
//       })
  
//       res.status(200).json({
//         access_token : accessToken,
//         tokenType : 'Bearer',
//         status: 200,
//         message: 'Login success' + accessToken + " Refresh - : " + refreshToken
//       })
  
//     } catch (err) {
//       if (err instanceof Error && err.msBeforeNext) {
//         const retryAfter = Math.ceil(err.msBeforeNext / 1000 / 60);
//         return next(
//           createError(
//             409,
//             `Too many attempts. Try again in ${retryAfter} minutes.`
//           )
//         ); // Replace with invalid user / pass
//       }
//       const retryAfter = Math.ceil(err.msBeforeNext / 1000 / 60);
//       return next(
//         createError(
//           409,
//           `Too many attempts. Try again in ${retryAfter} minutes.`
//         )
//       ); // Replace with invalid user / pass
//     }
// }

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

    // Generate new token version in Node.js instead of DB
    const newTokenVersion = uuidv4();

    // Update token version and get user in one query
    const { rows } = await pool.query(
      `UPDATE users 
             SET token_version = $1
             WHERE username = $2
             RETURNING id, username, password, is_active`,
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

    // Generate tokens
    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          username: user.username,
        },
        jti: uuidv4(),
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "15m",
        issuer: "Kimaru", //process.env.JWT_ISSUER,
        audience: "Kimaru", // process.env.JWT_AUDIENCE,
      }
    );

    const refreshToken = jwt.sign(
      {
        user: { id: user.id },
        tokenVersion: newTokenVersion,
        jti: uuidv4(),
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
        issuer: "Kimaru",  // process.env.JWT_ISSUER,
        audience: "Kimaru", // process.env.JWT_AUDIENCE,
      }
    );

    // Store refresh token with Node.js generated UUID
    const tokenId = uuidv4();
    await pool.query(
      `INSERT INTO refresh_tokens 
             (token_id, user_id, token, user_agent, ip_address, expires_at) 
             VALUES ($1, $2, $3, $4, $5, NOW() + interval '7 days')`,
      [
        tokenId,
        user.id,
        await bcrypt.hash(refreshToken, 12), // Stronger hash
        userAgent,
        ip,
      ]
    );

    // Set cookies
    const csrfToken = uuidv4();
    res.cookie("XSRF-TOKEN", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 900000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 900,
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

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    // 2. Check token in database (important for revocation)
    const tokenRecord = await pool.query(
      `SELECT revoked_at FROM refresh_tokens 
             WHERE token_id = $1 AND user_id = $2`,
      [decoded.jti, decoded.userId]
    );

    // 3. Validate token status
    if (!tokenRecord.rows.length || tokenRecord.rows[0].revoked_at) {
      res.clearCookie("refresh_token");
      return next(createError(403, "Invalid token"));
    }

    // 4. Generate new access token with short expiry
    const newAccessToken = jwt.sign(
      {
        user: {
          id: decoded.user.id,
          username: decoded.user.username,
        },
        jti: crypto.randomUUID(), // Unique identifier
        scope: "access", // Token purpose
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "15m",
        issuer: "your-domain.com",
        audience: "your-domain.com",
      }
    );

    // 5. Response with new token
    res.json({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 15 * 60, // 15 minutes in seconds
    });
  } catch (err) {
    res.clearCookie("refresh_token");

    if (err.name === "TokenExpiredError") {
      // 6. Automatic cleanup of expired tokens
      await pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_id = $1",
        [decoded?.jti]
      );
      return next(createError(401, "Session expired"));
    }

    next(createError(403, "Invalid token"));
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
    const accessToken = req.headers.authorization?.split(' ')[1]; // Bearer token

    try {
        await pool.query('BEGIN');

        // 1. Revoke refresh token (and its replacements)
        if (refreshToken) {
            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
                await revokeTokenFamily(decodedRefresh.jti);
            } catch (err) {
                console.warn('Invalid refresh token during logout:', err.message);
            }
        }

        // 2. Blacklist access token
        if (accessToken) {
            try {
                const decodedAccess = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, { ignoreExpiration: true });
                await pool.query(
                    'INSERT INTO revoked_tokens (token_id, user_id, expires_at) VALUES ($1, $2, $3)',
                    [decodedAccess.jti, decodedAccess.user.id, new Date(decodedAccess.exp * 1000)]
                );
            } catch (err) {
                console.warn('Invalid access token during logout:', err.message);
            }
        }

        await pool.query('COMMIT');

        // 3. Clear the refresh token cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh', // MUST match path used when setting the cookie
        });

        // Optional: force-expire cookie just in case
        res.cookie('refresh_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh',
            expires: new Date(0),
        });

        // 4. Tell frontend to clear local tokens
        res.json({
            success: true,
            message: 'Logged out successfully.',
            clearClientTokens: true,
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Logout failed:', err);
        next(createError(500, 'Logout failed'));
    }
};