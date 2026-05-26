const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres.foguzyzetaakkbihhwbq:tanvir483469@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log("Connected successfully to postgres database!");
    const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    console.log("Public tables:", res.rows.map(r => r.tablename));
    await client.end();
  } catch (err) {
    console.error("Connection failed with standard credentials:", err);
  }
}
test();
