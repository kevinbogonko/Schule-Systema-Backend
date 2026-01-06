import bcrypt from "bcrypt";
import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";

export const allUsers = async (req, res, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  const { is_active, role } = req.body;

  try {
    // 1️⃣ Validate input
    if (is_active === undefined || role === undefined) {
      return next(createError(400, "Both 'is_active' and 'role' are required"));
    }

    // 2️⃣ Build WHERE clause dynamically
    let isActiveCondition = "";
    const queryParams = [];

    if (is_active === 1) {
      isActiveCondition = "is_active = true";
    } else if (is_active === 0) {
      isActiveCondition = "is_active = false";
    } else if (is_active === 2) {
      isActiveCondition = "1=1"; // both true and false → no filter
    } else {
      return next(
        createError(400, "Invalid is_active value. Must be 0, 1, or 2")
      );
    }

    // 3️⃣ Add role condition
    let roleCondition = "";
    if (role && role !== "all") {
      queryParams.push(role);
      roleCondition = "AND role = $1";
    }

    // 4️⃣ Construct base query
    let query = `
      SELECT id, username, role, user_id
      FROM users
      WHERE ${isActiveCondition} ${roleCondition}
      ORDER BY created_at DESC
    `;

    const usersResult = await pool.query(query, queryParams);

    if (usersResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    const users = [];

    // 5️⃣ Loop and attach full name from related tables
    for (const user of usersResult.rows) {
      let fullName = user.username;

      if (user.role === "student") {
        const studentRes = await pool.query(
          "SELECT fname, lname FROM students WHERE id = $1",
          [user.user_id]
        );
        if (studentRes.rows.length > 0) {
          fullName = `${studentRes.rows[0].fname} ${studentRes.rows[0].lname}`;
        }
      } else if (user.role === "teacher") {
        const teacherRes = await pool.query(
          "SELECT fname, lname FROM staff WHERE id = $1",
          [user.user_id]
        );
        if (teacherRes.rows.length > 0) {
          fullName = `${teacherRes.rows[0].fname} ${teacherRes.rows[0].lname}`;
        }
      }

      users.push({
        id: user.id,
        username: user.username,
        role: user.role,
        user_id: user.user_id,
        fullname: fullName,
      });
    }

    // 6️⃣ Respond with results
    res.status(200).json(users);
  } catch (err) {
    next(createError(500, "Failed to retrieve users"));
  }
};

export const getUser = async (req, res, next) => {
  // 1️⃣ Check request type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2️⃣ Extract and validate input
  const { id } = req.body;
  if (!id) {
    return next(createError(400, "User ID is required"));
  }

  try {
    // 3️⃣ Query database for username
    const query = `
      SELECT username 
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    // 4️⃣ Check if user exists
    if (result.rows.length === 0) {
      return next(createError(404, "User not found"));
    }

    // 5️⃣ Return user info (excluding password)
    const user = result.rows[0];

    res.status(200).json({
      id: user.id,
      username: user.username,
    });
  } catch (err) {
    console.error("Error retrieving user:", err);
    next(createError(500, "Failed to retrieve user"));
  }
};

export const updateUser = async (req, res, next) => {
  // 1️⃣ Check request type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2️⃣ Extract and validate input
  const { id, username, password } = req.body;
  if (!id || !username || !password) {
    return next(createError(400, "Required fields are missing!"));
  }

  // 3️⃣ Validate password strength (minimum 8 chars)
  if (password.length < 8) {
    return next(
      createError(400, "Password must be at least 8 characters long")
    );
  }

  try {
    // 4️⃣ Hash the new password securely
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // 5️⃣ Update the user password in the database
    const result = await pool.query(
      `UPDATE users
       SET password = $1,
           updated_at = NOW()
       WHERE username = $2 AND id = $3
       RETURNING id, username`,
      [hash, username, id]
    );

    // 6️⃣ Check if the update succeeded
    if (result.rowCount === 0) {
      return next(createError(404, "User not found or no changes made"));
    }

    // 7️⃣ Return success response (do not return password)
    res.status(200).json({
      message: "Password updated successfully",
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
      },
    });
  } catch (error) {
    console.error("Error updating user password:", error);
    next(createError(500, "Failed to update password"));
  }
};

export const deleteUser = async (req, res, next) => {
  // 1️⃣ Check Content-Type
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }

  // 2️⃣ Extract and validate input
  const { id } = req.body;
  if (!id) {
    return next(createError(400, "User ID is required"));
  }

  try {
    // 3️⃣ Attempt to delete the user
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username`,
      [id]
    );

    // 4️⃣ Check if user existed
    if (result.rows.length === 0) {
      return next(createError(404, "User not found"));
    }

    // 5️⃣ Respond with success
    res.status(200).json({
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    next(createError(500, "Failed to delete user"));
  }
};
