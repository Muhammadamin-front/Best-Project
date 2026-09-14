import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { prayerSaves } from "../../../../../db/schema";
import { requireProfile } from "../../../../../lib/server-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    const db = getDb();
    const [existing] = await db.select({ id: prayerSaves.id }).from(prayerSaves).where(and(eq(prayerSaves.prayerRequestId, id), eq(prayerSaves.userId, profile.id))).limit(1);
    if (existing) {
      await db.delete(prayerSaves).where(eq(prayerSaves.id, existing.id));
      return Response.json({ saved: false });
    }
    await db.insert(prayerSaves).values({ id: `sav_${crypto.randomUUID()}`, prayerRequestId: id, userId: profile.id });
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
