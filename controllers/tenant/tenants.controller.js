import crypto from "crypto";
import bcrypt from "bcrypt";
import pg from "pg";
import dotenv from 'dotenv'
import { centralPool } from "../../config/db_connection.js";
import pool from "../../config/db_connection.js";
import { validationResult } from "express-validator";
import { createError } from "../../utils/ErrorHandler.js";
import { validate as isUuid } from "uuid";

dotenv.config()
const { Client } = pg;

// Create Tenant DB
export const createTenantDb = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { tenant } = req.body;
  const dbName = `${tenant.schema_name}_db`;

  let centralClient;
  let tenantClient;

  try {
    // Start Central Db Transaction
    centralClient = await centralPool.connect();
    await centralClient.query("BEGIN");

    // Insert Teanant - Central Db
    const insertTenantQuery = `
      INSERT INTO tenants (
        name,
        schema_name,
        db_host,
        db_port,
        db_name,
        db_user,
        db_password,
        modules,
        modules_expiry,
        category
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10)
      RETURNING id
    `;

    const { rows } = await centralClient.query(insertTenantQuery, [
      tenant.name,
      tenant.schema_name,
      process.env.DB_HOST,
      process.env.DB_PORT,
      dbName,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      JSON.stringify(tenant.modules ?? {}),
      JSON.stringify(tenant.modules_expiry ?? {}),
      tenant.category,
    ]);

    const tenantId = rows[0].id;

    // Create Tenant Db from Template
    await centralPool.query(`
      CREATE DATABASE "${dbName}"
      WITH TEMPLATE tenant_template
    `);

    // Connect to Tenant Db
    tenantClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    await tenantClient.connect();
    await tenantClient.query("BEGIN");

    // Update Particulars
    await tenantClient.query(
      `
      UPDATE public.particulars
      SET
        schoolname = $1,
        motto = $2,
        phone = $3,
        address = $4,
        email = $5,
        school_init = $6
      WHERE id = $7
    `,
      [
        tenant.name,
        tenant.motto,
        tenant.phone,
        tenant.address,
        tenant.email,
        tenant.schema_name,
        119,
      ],
    );

    // Create Admin User

    // generate admin389f@kimaru.sch
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const randomLetter = crypto.randomBytes(1).toString("hex")[0];

    const username = `admin${randomDigits}${randomLetter}@${tenant.schema_name}.sch`;

    // password from tenant.password
    const plainPassword = tenant.password;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await tenantClient.query(
      `
      INSERT INTO users (
        id,
        username,
        password,
        is_active,
        role,
        user_id
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        true,
        'admin',
        $3
      )
    `,
      [username, hashedPassword, 119],
    );

    // Commit tenant db
    await tenantClient.query("COMMIT");
    await tenantClient.end();

    // Commit Central
    await centralClient.query("COMMIT");

    // Response
    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      tenant_id: tenantId,
      database: dbName,
      admin_user: username,
      // admin_password: plainPassword,
    });
  } catch (error) {
    console.error("Tenant creation failed:", error);

    // Rollback everything

    if (tenantClient) {
      await tenantClient.query("ROLLBACK").catch(() => {});
      await tenantClient.end().catch(() => {});
    }

    if (centralClient) {
      await centralClient.query("ROLLBACK").catch(() => {});
    }

    await centralPool
      .query(`DROP DATABASE IF EXISTS "${dbName}"`)
      .catch(() => {});

    return next(createError(500, "Failed to create tenant"));
  } finally {
    if (centralClient) centralClient.release();
  }
};

// Get All tenants with Filter (Active | Inactive)
export const getTenants = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { category, status } = req.body;

  try {
    let query = `
      SELECT *
      FROM tenants
      WHERE 1 = 1
    `;
    const values = [];
    let index = 1;

    if (category) {
      query += ` AND category = $${index++}`;
      values.push(category);
    }

    if (status) {
      query += ` AND status = $${index++}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, values);

    return res.status(200).json(rows);
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

// Get Single tenant
export const getTenant = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { id } = req.body;

  try {
    let query = `
      SELECT *
      FROM tenants
      WHERE id = $1
    `;
 
    const { rows } = await pool.query(query, [id]);

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

// update tenant
export const updateTenant = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { id, name, category, modules, modules_expiry } = req.body;

  // Validate UUID early
  if (!isUuid(id)) {
    return next(createError(400, "Invalid tenant id"));
  }

  try {
    const updateQuery = `
      UPDATE tenants
      SET
        name = $1,
        category = $2,
        modules = $3::jsonb,
        modules_expiry = $4::jsonb
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      name.trim(),
      category,
      JSON.stringify(modules),
      JSON.stringify(modules_expiry),
      id,
    ];

    const { rowCount, rows } = await pool.query(updateQuery, values);

    if (rowCount === 0) {
      return next(createError(404, "Tenant not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: rows[0],
    });
  } catch (error) {
    return next(createError(500, "Failed to update tenant"));
  }
};

// Delete Tenant and DB
export const deleteTenant = async (req, res, next) => {
  const { tenantId } = req.params;

  let centralClient;
  let dbName;

  try {
    /* -------- PHASE 1: TRANSACTION (METADATA) -------- */
    centralClient = await centralPool.connect();
    await centralClient.query("BEGIN");

    const { rows } = await centralClient.query(
      "SELECT id, db_name FROM tenants WHERE schema_name = $1",
      [tenantId],
    );

    if (!rows.length) {
      throw createError(404, "Tenant not found");
    }

    const dbName = rows[0].db_name;
    const dbUUID = rows[0].id

    // Delete tenant record
    await centralClient.query("DELETE FROM tenants WHERE id = $1", [dbUUID]);

    await centralClient.query("COMMIT");
    centralClient.release();
    centralClient = null;

    /* -------- PHASE 2: DB DELETION (NO TRANSACTION) -------- */

    // Kill active connections
    await centralPool.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
        AND pid <> pg_backend_pid()
    `,
      [dbName],
    );

    // Drop database (must be outside transaction)
    await centralPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);

    return res.json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    if (centralClient) {
      await centralClient.query("ROLLBACK").catch(() => {});
      centralClient.release();
    }
    console.error(error);
    return next(createError(500, "Failed to delete tenant"));
  }
};
