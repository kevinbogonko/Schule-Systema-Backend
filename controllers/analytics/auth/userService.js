import bcrypt from "bcrypt";
import pool from "../../../config/db_connection.js";

export const createUserAccount = async ({
  firstname,
  lastname,
  phone,
  role,
  user_ref_id,
}) => {
  // 1 Fetch school_init
  const schoolInitRes = await pool.query(
    "SELECT school_init FROM particulars WHERE id = 119"
  );
  const schoolInit = schoolInitRes.rows[0]?.school_init || "school";

  // 2 Generate username
  const rand = Math.floor(10 + Math.random() * 90);
  const username =
    `${firstname}${lastname}${rand}@${schoolInit}.sch`.toLowerCase();

  // 3 Hash password (default = phone)
  const hash = await bcrypt.hash(phone, 10);

  // 4 Insert into users
  const userRes = await pool.query(
    `INSERT INTO users (username, password, user_id, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username`,
    [username, hash, user_ref_id, role]
  );

  // 5 Return account details
  return {
    userId: userRes.rows[0].id,
    username: userRes.rows[0].username,
    // defaultPassword: phone,
  };
};
