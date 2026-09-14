import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications } from "../../../db/schema";
import { requireProfile } from "../../../lib/server-auth";

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const rows = await getDb().select().from(notifications).where(eq(notifications.userId, profile.id)).orderBy(desc(notifications.createdAt)).limit(50);
    return Response.json({ notifications: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const payload = await request.json() as { id?: string };
    const db = getDb();
    const condition = payload.id ? and(eq(notifications.userId, profile.id), eq(notifications.id, payload.id)) : and(eq(notifications.userId, profile.id), isNull(notifications.readAt));
    await db.update(notifications).set({ readAt: new Date().toISOString() }).where(condition);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
