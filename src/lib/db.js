import { Pool } from "pg";
import { DATABASE_URL } from "@/lib/env";

let pool;

/**
 * Returns a singleton PostgreSQL connection pool.
 * Uses DATABASE_URL from secret.js.
 */
export function getDb() {
  if (!pool) {
    const isLocal = DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1");
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[DB] Unexpected pool error:", err.message);
    });
  }
  return pool;
}

/**
 * Execute a parameterised query against the pool.
 * @param {string} text  - SQL query string with $1, $2 placeholders
 * @param {any[]}  params - Ordered array of values
 */
export async function query(text, params = []) {
  const db = getDb();
  const start = Date.now();
  try {
    const result = await db.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DB] query(${duration}ms) rows=${result.rowCount}`);
    }
    return result;
  } catch (err) {
    console.error("[DB] Query error:", err.message, "\nSQL:", text);
    throw err;
  }
}

/**
 * Run multiple queries in a single transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn
 */
export async function withTransaction(fn) {
  const db = getDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export default { getDb, query, withTransaction };
