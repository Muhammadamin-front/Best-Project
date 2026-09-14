import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { mosqueActions, mosqueMembers, mosqueReferrals, mosques, notifications, prayerRequests } from "../../../../../db/schema";
import { referralActionSchema } from "../../../../../lib/product";
import { requireProfile } from "../../../../../lib/server-auth";

async function canManageMosque(profileId: string, role: string, mosqueId: string) {
  if (role === "admin") return true;
  const [membership] = await getDb().select({ id: mosqueMembers.id }).from(mosqueMembers).where(and(eq(mosqueMembers.mosqueId, mosqueId), eq(mosqueMembers.userId, profileId))).limit(1);
  return Boolean(membership);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    if (!await canManageMosque(profile.id, profile.role, id)) return Response.json({ error: "Forbidden" }, { status: 403 });
    const rows = await getDb().select({ id: mosqueReferrals.id, status: mosqueReferrals.status, createdAt: mosqueReferrals.createdAt, requestId: prayerRequests.id, title: prayerRequests.title, body: prayerRequests.body, category: prayerRequests.category, isEmergency: prayerRequests.isEmergency }).from(mosqueReferrals).innerJoin(prayerRequests, eq(mosqueReferrals.prayerRequestId, prayerRequests.id)).where(eq(mosqueReferrals.mosqueId, id)).orderBy(desc(mosqueReferrals.createdAt)).limit(100);
    return Response.json({ referrals: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const { id: mosqueId } = await context.params;
    const payload = await request.json() as { prayerRequestId?: string };
    if (!payload.prayerRequestId) return Response.json({ error: "prayerRequestId is required" }, { status: 400 });
    const db = getDb();
    const [[mosque], [prayer]] = await Promise.all([
      db.select({ id: mosques.id }).from(mosques).where(and(eq(mosques.id, mosqueId), eq(mosques.status, "verified"))).limit(1),
      db.select({ id: prayerRequests.id, authorId: prayerRequests.authorId, consent: prayerRequests.mosqueReferralConsent }).from(prayerRequests).where(eq(prayerRequests.id, payload.prayerRequestId)).limit(1),
    ]);
    if (!mosque) return Response.json({ error: "Verified mosque not found" }, { status: 404 });
    if (!prayer || prayer.authorId !== profile.id || !prayer.consent) return Response.json({ error: "Referral requires request-owner consent" }, { status: 403 });
    const referralId = `mrf_${crypto.randomUUID()}`;
    await db.insert(mosqueReferrals).values({ id: referralId, mosqueId, prayerRequestId: prayer.id, userConsentAt: new Date().toISOString() }).onConflictDoNothing();
    return Response.json({ id: referralId, status: "pending" }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const { id: mosqueId } = await context.params;
    if (!await canManageMosque(profile.id, profile.role, mosqueId)) return Response.json({ error: "Forbidden" }, { status: 403 });
    const raw = await request.json() as { referralId?: string; action?: string; note?: string };
    const parsed = referralActionSchema.safeParse({ action: raw.action, note: raw.note });
    if (!parsed.success || !raw.referralId) return Response.json({ error: "Invalid referral action" }, { status: 400 });
    const db = getDb();
    const [referral] = await db.select({ id: mosqueReferrals.id, prayerRequestId: mosqueReferrals.prayerRequestId }).from(mosqueReferrals).where(and(eq(mosqueReferrals.id, raw.referralId), eq(mosqueReferrals.mosqueId, mosqueId))).limit(1);
    if (!referral) return Response.json({ error: "Referral not found" }, { status: 404 });
    const nextStatus = parsed.data.action === "included_in_prayer" ? "included_in_prayer" : parsed.data.action === "accept" ? "accepted" : "declined";
    await db.batch([
      db.update(mosqueReferrals).set({ status: nextStatus, updatedAt: new Date().toISOString() }).where(eq(mosqueReferrals.id, referral.id)),
      db.insert(mosqueActions).values({ id: `msa_${crypto.randomUUID()}`, referralId: referral.id, actorId: profile.id, action: parsed.data.action, note: parsed.data.note || null }),
    ]);
    const [prayer] = await db.select({ authorId: prayerRequests.authorId, title: prayerRequests.title }).from(prayerRequests).where(eq(prayerRequests.id, referral.prayerRequestId)).limit(1);
    if (prayer?.authorId) await db.insert(notifications).values({ id: `ntf_${crypto.randomUUID()}`, userId: prayer.authorId, type: "mosque_referral", title: "Masjid yangilanishi", body: `“${prayer.title}” so‘rovingiz: ${nextStatus}.` });
    return Response.json({ status: nextStatus });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
