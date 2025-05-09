import pool from "../../../config/db_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";

export const getSMSResultLogs = async (req, res, next) => {
  const { unival } = req.body;

  try {
    if (!req.is("application/json")) {
      return next(
        createError(415, "Unsupported Media Type: Expected application/json")
      );
    }

    const result = await pool.query("SELECT * FROM smslogs WHERE unival = $1", [
      unival,
    ]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      next(createError(404, "SMS Logs not Found"));
    }
  } catch (err) {
    next(err);
  }
};
