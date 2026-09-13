import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { getDb } from "../../../../../db";
import { prayerSupports, profiles } from "../../../../../db/schema";

async function identity(request: Request) {
  const user = await getChatGPTUser();
  if (user) return user;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1"
    ? { email: "demo@duodosh.local", displayName: "Aziza" }
    : null;
}

async function stableUserId(email: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return `usr_${Array.from(new Uint8Array(hash)).slice(0, 12).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await identity(request);
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await context.params;
    const db = getDb();
    const userId = await stableUserId(user.email);
    await db.insert(profiles).values({ id: userId, email: user.email, displayName: user.displayName }).onConflictDoNothing();

    const existing = await db.select({ id: prayerSupports.id }).from(prayerSupports)
      .where(and(eq(prayerSupports.prayerRequestId, id), eq(prayerSupports.userId, userId))).limit(1);

    if (existing[0]) {
      await db.delete(prayerSupports).where(eq(prayerSupports.id, existing[0].id));
      return Response.json({ supported: false });
    }

    await db.insert(prayerSupports).values({ id: `sup_${crypto.randomUUID()}`, prayerRequestId: id, userId });
    return Response.json({ supported: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
