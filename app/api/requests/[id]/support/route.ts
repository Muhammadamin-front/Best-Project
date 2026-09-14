import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { notifications, prayerRequests, prayerSupports } from "../../../../../db/schema";
import { requireProfile } from "../../../../../lib/server-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });

    const existing = await db.select({ id: prayerSupports.id }).from(prayerSupports)
      .where(and(eq(prayerSupports.prayerRequestId, id), eq(prayerSupports.userId, profile.id))).limit(1);

    if (existing[0]) {
      await db.delete(prayerSupports).where(eq(prayerSupports.id, existing[0].id));
      return Response.json({ supported: false });
    }

    await db.insert(prayerSupports).values({ id: `sup_${crypto.randomUUID()}`, prayerRequestId: id, userId: profile.id });
    const [target] = await db.select({ authorId: prayerRequests.authorId, title: prayerRequests.title }).from(prayerRequests).where(eq(prayerRequests.id, id)).limit(1);
    if (target?.authorId && target.authorId !== profile.id) {
      await db.insert(notifications).values({ id: `ntf_${crypto.randomUUID()}`, userId: target.authorId, type: "prayer_support", title: "Yangi duo", body: `Kimdir “${target.title}” so‘rovingizni duoda esladi.` });
    }
    return Response.json({ supported: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
