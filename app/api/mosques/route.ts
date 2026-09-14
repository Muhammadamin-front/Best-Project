import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { mosqueVerificationRequests, mosques } from "../../../db/schema";
import { mosqueApplicationSchema } from "../../../lib/product";
import { requireProfile } from "../../../lib/server-auth";

export async function GET() {
  try {
    const rows = await getDb().select({ id: mosques.id, name: mosques.name, description: mosques.description, address: mosques.address, city: mosques.city, country: mosques.country }).from(mosques).where(eq(mosques.status, "verified")).orderBy(asc(mosques.city), asc(mosques.name));
    return Response.json({ mosques: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const parsed = mosqueApplicationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid mosque application", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const db = getDb();
    const mosqueId = `msq_${crypto.randomUUID()}`;
    const verificationId = `mvr_${crypto.randomUUID()}`;
    await db.batch([
      db.insert(mosques).values({ id: mosqueId, name: parsed.data.name, description: parsed.data.description, address: parsed.data.address || null, city: parsed.data.city, country: parsed.data.country }),
      db.insert(mosqueVerificationRequests).values({ id: verificationId, mosqueId, requestedBy: profile.id, evidence: parsed.data.evidence }),
    ]);
    return Response.json({ mosqueId, verificationId, status: "pending" }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
