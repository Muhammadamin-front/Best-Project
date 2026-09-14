import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications, prayerRequests, prayerSaves, prayerSupports } from "../../../db/schema";
import { requireProfile } from "../../../lib/server-auth";

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const db = getDb();
    const [[support], [saved], [active], [unread]] = await Promise.all([
      db.select({ count: sql<number>`count(distinct ${prayerSupports.prayerRequestId})` }).from(prayerSupports).where(and(eq(prayerSupports.userId, profile.id), sql`${prayerSupports.createdAt} >= datetime('now', '-24 hours')`)),
      db.select({ count: sql<number>`count(*)` }).from(prayerSaves).where(eq(prayerSaves.userId, profile.id)),
      db.select({ count: sql<number>`count(*)` }).from(prayerRequests).where(and(eq(prayerRequests.authorId, profile.id), eq(prayerRequests.status, "published"))),
      db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, profile.id), isNull(notifications.readAt))),
    ]);
    return Response.json({
      profile: { id: profile.id, displayName: profile.displayName, city: profile.city, country: profile.country, preferredLanguage: profile.preferredLanguage, role: profile.role },
      stats: { supportToday: Number(support?.count ?? 0), saved: Number(saved?.count ?? 0), activeRequests: Number(active?.count ?? 0), unreadNotifications: Number(unread?.count ?? 0) },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
