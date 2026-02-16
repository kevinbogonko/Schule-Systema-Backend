import pg from "pg";
import dotenv from "dotenv";

// Configure environment variables
dotenv.config();

const { Pool } = pg;

// Central database pool - for shared/tenant management data
const centralPool = new Pool({
  host: process.env.CENTRAL_DB_HOST || process.env.DB_HOST,
  user: process.env.CENTRAL_DB_USER || process.env.DB_USER,
  port: process.env.CENTRAL_DB_PORT || process.env.DB_PORT,
  password: process.env.CENTRAL_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.CENTRAL_DB_NAME || process.env.DB_NAME,
});

// Test central database connection
centralPool
  .connect()
  .then((client) => {
    console.log("✅ Successful connection to CENTRAL database established...");
    client.release();
  })
  .catch((err) => console.error("❌ Central database connection error:", err));

// Cache for tenant database pools
const tenantPools = new Map();

// Initialize and export a tenant database pool
// This should be called once during app startup with the current tenant config

let tenantPool = null;

// Initialize the tenant database pool

function initTenantPool(tenantConfig) {
  const cacheKey =
    tenantConfig.schema_name || tenantConfig.db_name || "default";

  // Check if pool already exists in cache
  if (tenantPools.has(cacheKey)) {
    tenantPool = tenantPools.get(cacheKey);
    return tenantPool;
  }

  // Create new pool
  tenantPool = new Pool({
    host: tenantConfig.db_host,
    port: tenantConfig.db_port,
    user: tenantConfig.db_user,
    password: tenantConfig.db_password,
    database: tenantConfig.db_name,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Store in cache
  tenantPools.set(cacheKey, tenantPool);

  // Test connection
  tenantPool
    .connect()
    .then((client) => {
      console.log(`✅ Tenant database pool initialized for: ${cacheKey}`);
      client.release();
    })
    .catch((err) =>
      console.error(`❌ Tenant pool initialization error:`, err.message),
    );

  return tenantPool;
}

// Switch to a different tenant pool
function switchTenantPool(tenantConfig) {
  return initTenantPool(tenantConfig);
}

// Get the current tenant pool
function getTenantPool() {
  if (!tenantPool) {
    throw new Error(
      "Tenant pool not initialized. Call initTenantPool() first.",
    );
  }
  return tenantPool;
}

//Clean up all database connections
async function cleanupAllConnections() {
  console.log("Cleaning up database connections...");

  try {
    await centralPool.end();
    console.log("Central database connections closed");
  } catch (err) {
    console.error("Error closing central pool:", err);
  }

  const closePromises = [];
  tenantPools.forEach((pool, key) => {
    closePromises.push(
      pool
        .end()
        .then(() => console.log(`Tenant pool ${key} closed`))
        .catch((err) =>
          console.error(`Error closing tenant pool ${key}:`, err),
        ),
    );
  });

  await Promise.all(closePromises);
  tenantPools.clear();
  tenantPool = null;
  console.log("All database connections cleaned up");
}

// Export `tenantPool` ALSO as `pool`
// This keeps pool.query(...) working everywhere

export {
  centralPool,
  initTenantPool,
  getTenantPool,
  switchTenantPool,
  cleanupAllConnections,
  tenantPool,
};

const pool = {
  query: (...args) => {
    if (tenantPool) {
      return tenantPool.query(...args);
    }
    return centralPool.query(...args);
  },

  connect: (...args) => {
    if (tenantPool) {
      return tenantPool.connect(...args);
    }
    return centralPool.connect(...args);
  },
};

export default pool;