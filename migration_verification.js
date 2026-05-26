const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Manually load .env variables
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  }
}

const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PASSWORD;
const pgHost = process.env.PG_HOST;
const pgPort = process.env.PG_PORT || "5432";
const pgDb = process.env.PG_DB || "postgres";

const DATABASE_URL = pgUser && pgPassword && pgHost
  ? `postgresql://${encodeURIComponent(pgUser)}:${encodeURIComponent(pgPassword)}@${pgHost}:${pgPort}/${pgDb}`
  : process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/edusaas";

async function migrate() {
  console.log("Connecting to database for verification system migration...");
  const isLocal = DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Altering 'saas_users' table to add verification columns...");
    await client.query(`
      ALTER TABLE saas_users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP DEFAULT NULL;
    `);

    console.log("Marking existing users as verified for backwards compatibility...");
    await client.query(`
      UPDATE saas_users 
      SET is_verified = TRUE 
      WHERE is_verified IS NULL OR is_verified = FALSE;
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
