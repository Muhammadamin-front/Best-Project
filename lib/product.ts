import { z } from "zod";

export const categories = [
  "health",
  "family",
  "grief",
  "work",
  "livelihood",
  "emotional",
  "general",
  "other",
] as const;

export const prayerRequestSchema = z.object({
  title: z.string().trim().min(4).max(90),
  body: z.string().trim().min(20).max(2000),
  category: z.enum(categories),
  language: z.enum(["uz", "en", "ru"]).default("uz"),
  city: z.string().trim().max(80).optional().default(""),
  country: z.string().trim().max(80).optional().default(""),
  isAnonymous: z.boolean().default(true),
  visibility: z.enum(["public", "city"]).default("public"),
  mosqueReferralConsent: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
});

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

export const commentSchema = z.object({ body: z.string().trim().min(2).max(600) });
export const reportSchema = z.object({
  targetType: z.enum(["prayer_request", "comment"]),
  targetId: z.string().min(3).max(120),
  reason: z.enum(["self_harm", "immediate_danger", "fraud", "harassment", "hate", "pii", "spam", "other"]),
  details: z.string().trim().max(800).optional().default(""),
});
export const moderationActionSchema = z.object({
  targetType: z.enum(["prayer_request", "comment", "report"]),
  targetId: z.string().min(3).max(120),
  action: z.enum(["publish", "limit", "reject", "resolve_report"]),
  note: z.string().trim().max(1000).optional().default(""),
});
export const mosqueApplicationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(800).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  evidence: z.string().trim().min(10).max(1200),
});
export const referralActionSchema = z.object({
  action: z.enum(["accept", "decline", "included_in_prayer"]),
  note: z.string().trim().max(800).optional().default(""),
});

const highRiskPatterns = [
  /o['‘’`]zimni o['‘’`]ldir/i,
  /jonimga qasd/i,
  /suicid/i,
  /kill myself/i,
  /domestic violence/i,
  /zo['‘’`]ravonlik/i,
];

const piiPatterns = [
  /\+?\d[\d\s()\-]{8,}\d/,
  /\b\d{2}\s?\d{7}\b/,
  /\b[A-Z]{2}\d{7}\b/i,
];

export function moderateText(value: string) {
  const highRisk = highRiskPatterns.some((pattern) => pattern.test(value));
  const containsPii = piiPatterns.some((pattern) => pattern.test(value));
  return {
    highRisk,
    containsPii,
    status: highRisk || containsPii ? "pending_moderation" : "published",
    contentWarning: highRisk ? "Og‘ir ruhiy holat haqida" : null,
  } as const;
}

export function safePublicAuthor(isAnonymous: boolean, displayName?: string | null) {
  return isAnonymous ? "Duodosh a’zosi" : displayName || "Duodosh a’zosi";
}
