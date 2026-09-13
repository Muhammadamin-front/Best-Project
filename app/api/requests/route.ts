import { and, desc, eq, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { prayerRequests, prayerSupports, profiles } from "../../../db/schema";
import { moderateText, prayerRequestSchema, safePublicAuthor } from "../../../lib/product";

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function currentUser(request: Request) {
  const user = await getChatGPTUser();
  if (user) return user;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1"
    ? { email: "demo@duodosh.local", displayName: "Aziza", fullName: "Aziza" }
    : null;
}

export async function GET() {
  try {
    const db = getDb();
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
      })
      .from(prayerRequests)
      .leftJoin(profiles, eq(prayerRequests.authorId, profiles.id))
      .leftJoin(prayerSupports, eq(prayerRequests.id, prayerSupports.prayerRequestId))
      .where(eq(prayerRequests.status, "published"))
      .groupBy(prayerRequests.id)
      .orderBy(sql`count(${prayerSupports.id}) asc`, desc(prayerRequests.createdAt))
      .limit(30);

    return Response.json({
      requests: rows.map((row) => ({
        ...row,
        author: safePublicAuthor(row.isAnonymous, row.displayName),
        displayName: undefined,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  try {
    const parsed = prayerRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = getDb();
    const userId = `usr_${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email)).then((b) => Array.from(new Uint8Array(b)).slice(0, 12).map((v) => v.toString(16).padStart(2, "0")).join(""))}`;
    await db.insert(profiles).values({ id: userId, email: user.email, displayName: user.displayName }).onConflictDoNothing();

    const supportResult = await db
      .select({ count: sql<number>`count(distinct ${prayerSupports.prayerRequestId})` })
      .from(prayerSupports)
      .where(and(eq(prayerSupports.userId, userId), sql`${prayerSupports.createdAt} >= datetime('now', '-24 hours')`));

    const contributionCount = Number(supportResult[0]?.count ?? 0);
    if (!parsed.data.isEmergency && contributionCount < 3) {
      return Response.json({ error: "CONTRIBUTION_REQUIRED", contributionCount, required: 3 }, { status: 403 });
    }

    const moderation = moderateText(`${parsed.data.title}\n${parsed.data.body}`);
    const status = parsed.data.isEmergency ? "pending_moderation" : moderation.status;
    const requestId = id("pr");
    await db.insert(prayerRequests).values({
      id: requestId,
      authorId: userId,
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
