const { Client } = require("pg");

// Since the Next.js runtime handles module imports, we'll write a standalone commonjs script for migration
const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PASSWORD;
const pgHost = process.env.PG_HOST;
const pgPort = process.env.PG_PORT || "5432";
const pgDb = process.env.PG_DB || "postgres";

const DATABASE_URL = pgUser && pgPassword && pgHost
  ? `postgresql://${encodeURIComponent(pgUser)}:${encodeURIComponent(pgPassword)}@${pgHost}:${pgPort}/${pgDb}`
  : process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/edusaas";

async function migrate() {
  console.log("Connecting to database for review system migration...");
  const isLocal = DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Creating 'reviews' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES saas_users(id) ON DELETE SET NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Creating trigger for updating timestamps...");
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_reviews_timestamp ON reviews;
      CREATE TRIGGER trigger_reviews_timestamp
      BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
    `);

    console.log("Creating indexes for optimized lookups...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_tenant ON reviews(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
