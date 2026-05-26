const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.foguzyzetaakkbihhwbq:tanvir483469@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database for initialization...");

    const sqlPath = path.join(__dirname, 'schema.psql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing schema.psql...");
    await client.query(sql);
    console.log("Schema initialized successfully!");

    const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    console.log("Created public tables:", res.rows.map(r => r.tablename));

    await client.end();
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  }
}

main();
