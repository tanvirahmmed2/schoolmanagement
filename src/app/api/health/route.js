import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/** GET /api/health — public health check */
export async function GET() {
  const start = Date.now();
  let dbOk = false;
  try {
    await getDb().query("SELECT 1");
    dbOk = true;
  } catch {}

  const status = dbOk ? 200 : 503;
  return NextResponse.json({
    status:    dbOk ? "ok" : "degraded",
    db:        dbOk ? "connected" : "unreachable",
    uptime:    Math.floor(process.uptime()),
    latencyMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  }, { status });
}
