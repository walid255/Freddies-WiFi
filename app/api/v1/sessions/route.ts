import { NextResponse } from "next/server";
import { AuthorizationError, requireProcedure } from "@/lib/auth";

export async function GET() {
  try {
    const { db, user } = await requireProcedure(["tenant_admin", "super_admin"]);
    if (!user.tenantId) {
      return NextResponse.json({ error: "A tenant context is required" }, { status: 403 });
    }

    const result = await db
      .prepare(
        `SELECT id, status, started_at AS startedAt, device_label AS deviceLabel
         FROM active_sessions
         WHERE tenant_id = ?1 AND status = 'online'
         ORDER BY started_at DESC
         LIMIT 100`,
      )
      .bind(user.tenantId)
      .all<{
        id: string;
        status: string;
        startedAt: string;
        deviceLabel: string | null;
      }>();

    return NextResponse.json(
      { sessions: result.results },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
