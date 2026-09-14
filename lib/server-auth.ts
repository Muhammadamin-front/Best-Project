import { eq } from "drizzle-orm";
import { getChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";
import { getDb } from "../db";
import { profiles } from "../db/schema";

export type AppRole = "user" | "moderator" | "mosque_representative" | "admin";

export async function stableUserId(email: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.toLowerCase()));
  return `usr_${Array.from(new Uint8Array(hash)).slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export async function requestIdentity(request: Request): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  if (user) return user;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1"
    ? { email: "demo@duodosh.local", displayName: "Aziza Karimova", fullName: "Aziza Karimova" }
    : null;
}

export async function requireProfile(request: Request) {
  const identity = await requestIdentity(request);
  if (!identity) return null;

  const db = getDb();
  const id = await stableUserId(identity.email);
  const localRole = new URL(request.url).hostname === "localhost" ? "admin" : "user";
  await db.insert(profiles).values({ id, email: identity.email, displayName: identity.displayName, role: localRole }).onConflictDoNothing();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return profile ?? null;
}

export async function requireRole(request: Request, roles: AppRole[]) {
  const profile = await requireProfile(request);
  if (!profile || !roles.includes(profile.role as AppRole)) return null;
  return profile;
}
