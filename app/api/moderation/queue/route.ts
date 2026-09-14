import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { auditLogs, comments, moderationActions, prayerRequests, reports } from "../../../../db/schema";
import { moderationActionSchema } from "../../../../lib/product";
import { requireRole } from "../../../../lib/server-auth";

export async function GET(request: Request) {
  try {
    const moderator = await requireRole(request, ["moderator", "admin"]);
    if (!moderator) return Response.json({ error: "Forbidden" }, { status: 403 });
    const db = getDb();
    const [flaggedRequests, openReports] = await Promise.all([
      db.select().from(prayerRequests).where(eq(prayerRequests.status, "pending_moderation")).orderBy(desc(prayerRequests.isEmergency), desc(prayerRequests.createdAt)).limit(100),
      db.select().from(reports).where(eq(reports.status, "open")).orderBy(desc(reports.priority), desc(reports.createdAt)).limit(100),
    ]);
    return Response.json({ flaggedRequests, openReports });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const moderator = await requireRole(request, ["moderator", "admin"]);
    if (!moderator) return Response.json({ error: "Forbidden" }, { status: 403 });
    const parsed = moderationActionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid moderation action" }, { status: 400 });
    const db = getDb();
    const actionId = `mod_${crypto.randomUUID()}`;
    if (parsed.data.targetType === "prayer_request") {
      const status = parsed.data.action === "publish" ? "published" : parsed.data.action === "limit" ? "limited" : "rejected";
      await db.update(prayerRequests).set({ status, updatedAt: new Date().toISOString() }).where(eq(prayerRequests.id, parsed.data.targetId));
    } else if (parsed.data.targetType === "comment") {
      const status = parsed.data.action === "publish" ? "published" : "rejected";
      await db.update(comments).set({ status }).where(eq(comments.id, parsed.data.targetId));
    } else {
      await db.update(reports).set({ status: "resolved" }).where(eq(reports.id, parsed.data.targetId));
    }
    await db.batch([
      db.insert(moderationActions).values({ id: actionId, moderatorId: moderator.id, targetType: parsed.data.targetType, targetId: parsed.data.targetId, action: parsed.data.action, note: parsed.data.note || null }),
      db.insert(auditLogs).values({ id: `aud_${crypto.randomUUID()}`, actorId: moderator.id, action: `moderation.${parsed.data.action}`, targetType: parsed.data.targetType, targetId: parsed.data.targetId, metadata: JSON.stringify({ note: parsed.data.note }) }),
    ]);
    return Response.json({ ok: true, actionId });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
