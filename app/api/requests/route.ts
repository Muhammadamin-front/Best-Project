import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { comments, prayerRequests, prayerSaves, prayerSupports, profiles } from "../../../db/schema";
import { moderateText, prayerRequestSchema, safePublicAuthor } from "../../../lib/product";
import { requestIdentity, requireProfile, stableUserId } from "../../../lib/server-auth";

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const identity = await requestIdentity(request);
    const viewerId = identity ? await stableUserId(identity.email) : null;
    const rows = await db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        body: prayerRequests.body,
        category: prayerRequests.category,
        city: prayerRequests.city,
        isAnonymous: prayerRequests.isAnonymous,
        isEmergency: prayerRequests.isEmergency,
        status: prayerRequests.status,
        createdAt: prayerRequests.createdAt,
        displayName: profiles.displayName,
        supportCount: sql<number>`count(${prayerSupports.id})`,
        commentCount: sql<number>`(select count(*) from ${comments} where ${comments.prayerRequestId} = ${prayerRequests.id} and ${comments.status} = 'published')`,
      })
      .from(prayerRequests)
      .leftJoin(profiles, eq(prayerRequests.authorId, profiles.id))
      .leftJoin(prayerSupports, eq(prayerRequests.id, prayerSupports.prayerRequestId))
      .where(eq(prayerRequests.status, "published"))
      .groupBy(prayerRequests.id)
      .orderBy(sql`count(${prayerSupports.id}) asc`, desc(prayerRequests.createdAt))
      .limit(30);

    const [supports, saves] = viewerId ? await Promise.all([
      db.select({ requestId: prayerSupports.prayerRequestId }).from(prayerSupports).where(eq(prayerSupports.userId, viewerId)),
      db.select({ requestId: prayerSaves.prayerRequestId }).from(prayerSaves).where(eq(prayerSaves.userId, viewerId)),
    ]) : [[], []];
    const supportedIds = new Set(supports.map((item) => item.requestId));
    const savedIds = new Set(saves.map((item) => item.requestId));

    return Response.json({
      requests: rows.map((row) => ({
        ...row,
        author: safePublicAuthor(row.isAnonymous, row.displayName),
        displayName: undefined,
        supported: supportedIds.has(row.id),
        saved: savedIds.has(row.id),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const parsed = prayerRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = getDb();
    const supportResult = await db
      .select({ count: sql<number>`count(distinct ${prayerSupports.prayerRequestId})` })
      .from(prayerSupports)
      .where(and(eq(prayerSupports.userId, profile.id), sql`${prayerSupports.createdAt} >= datetime('now', '-24 hours')`));

    const contributionCount = Number(supportResult[0]?.count ?? 0);
    if (!parsed.data.isEmergency && contributionCount < 3) {
      return Response.json({ error: "CONTRIBUTION_REQUIRED", contributionCount, required: 3 }, { status: 403 });
    }

    const moderation = moderateText(`${parsed.data.title}\n${parsed.data.body}`);
    const status = parsed.data.isEmergency ? "pending_moderation" : moderation.status;
    const requestId = id("pr");
    await db.insert(prayerRequests).values({
      id: requestId,
      authorId: profile.id,
      ...parsed.data,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      status,
      contentWarning: moderation.contentWarning,
    });

    return Response.json({ id: requestId, status }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
