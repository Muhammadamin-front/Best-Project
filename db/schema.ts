import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  city: text("city"),
  country: text("country"),
  preferredLanguage: text("preferred_language").notNull().default("uz"),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const prayerRequests = sqliteTable("prayer_requests", {
  id: text("id").primaryKey(),
  authorId: text("author_id").references(() => profiles.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull().default("uz"),
  country: text("country"),
  city: text("city"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  visibility: text("visibility").notNull().default("public"),
  mosqueReferralConsent: integer("mosque_referral_consent", { mode: "boolean" }).notNull().default(false),
  isEmergency: integer("is_emergency", { mode: "boolean" }).notNull().default(false),
  contentWarning: text("content_warning"),
  status: text("status").notNull().default("published"),
  resolvedAt: text("resolved_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const prayerSupports = sqliteTable("prayer_supports", {
  id: text("id").primaryKey(),
  prayerRequestId: text("prayer_request_id").notNull().references(() => prayerRequests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("prayer_support_user_request_unique").on(table.prayerRequestId, table.userId)]);

export const prayerSaves = sqliteTable("prayer_saves", {
  id: text("id").primaryKey(),
  prayerRequestId: text("prayer_request_id").notNull().references(() => prayerRequests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("prayer_save_user_request_unique").on(table.prayerRequestId, table.userId)]);

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  prayerRequestId: text("prayer_request_id").notNull().references(() => prayerRequests.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const prayerRequestUpdates = sqliteTable("prayer_request_updates", {
  id: text("id").primaryKey(),
  prayerRequestId: text("prayer_request_id").notNull().references(() => prayerRequests.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").notNull().references(() => profiles.id),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const moderationActions = sqliteTable("moderation_actions", {
  id: text("id").primaryKey(),
  moderatorId: text("moderator_id").notNull().references(() => profiles.id),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userSanctions = sqliteTable("user_sanctions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => profiles.id),
  moderatorId: text("moderator_id").notNull().references(() => profiles.id),
  type: text("type").notNull(),
  reason: text("reason").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mosques = sqliteTable("mosques", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address"),
  city: text("city").notNull(),
  country: text("country").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mosqueMembers = sqliteTable("mosque_members", {
  id: text("id").primaryKey(),
  mosqueId: text("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("representative"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("mosque_member_unique").on(table.mosqueId, table.userId)]);

export const mosqueVerificationRequests = sqliteTable("mosque_verification_requests", {
  id: text("id").primaryKey(),
  mosqueId: text("mosque_id").notNull().references(() => mosques.id),
  requestedBy: text("requested_by").notNull().references(() => profiles.id),
  evidence: text("evidence").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by").references(() => profiles.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mosqueReferrals = sqliteTable("mosque_referrals", {
  id: text("id").primaryKey(),
  mosqueId: text("mosque_id").notNull().references(() => mosques.id),
  prayerRequestId: text("prayer_request_id").notNull().references(() => prayerRequests.id),
  userConsentAt: text("user_consent_at").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mosqueActions = sqliteTable("mosque_actions", {
  id: text("id").primaryKey(),
  referralId: text("referral_id").notNull().references(() => mosqueReferrals.id),
  actorId: text("actor_id").notNull().references(() => profiles.id),
  action: text("action").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const platformSettings = sqliteTable("platform_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => profiles.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
