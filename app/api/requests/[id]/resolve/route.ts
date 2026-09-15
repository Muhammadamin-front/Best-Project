import { and, eq, ne } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { notifications, prayerRequests, prayerSupports } from "../../../../../db/schema";
import { requireProfile } from "../../../../../lib/server-auth";

const NOTIFICATION_BATCH_SIZE = 75;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });

    const { id } = await context.params;
    const db = getDb();
    const [target] = await db.select({
      id: prayerRequests.id,
      authorId: prayerRequests.authorId,
      title: prayerRequests.title,
      status: prayerRequests.status,
      resolvedAt: prayerRequests.resolvedAt,
    }).from(prayerRequests).where(eq(prayerRequests.id, id)).limit(1);

    if (!target) return Response.json({ error: "Request not found" }, { status: 404 });
    if (target.authorId !== profile.id) return Response.json({ error: "Only the request owner can resolve it" }, { status: 403 });
    if (target.status === "resolved") return Response.json({ resolved: true, resolvedAt: target.resolvedAt, notified: 0 });
    if (!["published", "pending_moderation"].includes(target.status)) {
      return Response.json({ error: "This request cannot be resolved" }, { status: 409 });
    }

    const supporters = await db.select({ userId: prayerSupports.userId })
      .from(prayerSupports)
      .where(and(eq(prayerSupports.prayerRequestId, id), ne(prayerSupports.userId, profile.id)));
    const resolvedAt = new Date().toISOString();
    const update = db.update(prayerRequests).set({ status: "resolved", resolvedAt, updatedAt: resolvedAt }).where(and(eq(prayerRequests.id, id), eq(prayerRequests.authorId, profile.id)));
    const notificationQueries = [];

    for (let offset = 0; offset < supporters.length; offset += NOTIFICATION_BATCH_SIZE) {
      const chunk = supporters.slice(offset, offset + NOTIFICATION_BATCH_SIZE);
      notificationQueries.push(db.insert(notifications).values(chunk.map(({ userId }) => ({
        id: `ntf_${crypto.randomUUID()}`,
        userId,
        type: "request_resolved",
        title: "Alhamdulillah, xushxabar",
        body: `“${target.title}” so‘rovi hal bo‘ldi. Duo qilganingiz uchun rahmat.`,
      }))));
    }

    if (notificationQueries.length > 0) {
      await db.batch([update, ...notificationQueries] as [typeof update, ...typeof notificationQueries]);
    } else {
      await update;
    }

    return Response.json({ resolved: true, resolvedAt, notified: supporters.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
