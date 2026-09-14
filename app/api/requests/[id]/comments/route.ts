import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { comments, notifications, prayerRequests, profiles } from "../../../../../db/schema";
import { commentSchema, moderateText } from "../../../../../lib/product";
import { requireProfile } from "../../../../../lib/server-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const rows = await db.select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, author: profiles.displayName }).from(comments).leftJoin(profiles, eq(comments.authorId, profiles.id)).where(and(eq(comments.prayerRequestId, id), eq(comments.status, "published"))).orderBy(asc(comments.createdAt)).limit(100);
    return Response.json({ comments: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const parsed = commentSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid comment" }, { status: 400 });
    const { id } = await context.params;
    const moderation = moderateText(parsed.data.body);
    const db = getDb();
    const commentId = `cmt_${crypto.randomUUID()}`;
    await db.insert(comments).values({ id: commentId, prayerRequestId: id, authorId: profile.id, body: parsed.data.body, status: moderation.status });
    const [target] = await db.select({ authorId: prayerRequests.authorId, title: prayerRequests.title }).from(prayerRequests).where(eq(prayerRequests.id, id)).limit(1);
    if (moderation.status === "published" && target?.authorId && target.authorId !== profile.id) {
      await db.insert(notifications).values({ id: `ntf_${crypto.randomUUID()}`, userId: target.authorId, type: "support_comment", title: "Yangi dalda", body: `“${target.title}” so‘rovingizga mehrli xabar yozildi.` });
    }
    return Response.json({ id: commentId, status: moderation.status }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
