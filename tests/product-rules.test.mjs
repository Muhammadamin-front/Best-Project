import assert from "node:assert/strict";
import test from "node:test";
import { moderateText, mosqueApplicationSchema, prayerRequestSchema, referralActionSchema, reportSchema, safePublicAuthor } from "../lib/product.ts";
import { distanceInMeters, normalizeOverpassPlaces } from "../lib/geo.ts";

test("validates a normal prayer request", () => {
  const result = prayerRequestSchema.safeParse({
    title: "Oilam uchun duo",
    body: "Oilamizga xotirjamlik va sabr berilishi uchun duoda eslang.",
    category: "family",
    language: "uz",
  });
  assert.equal(result.success, true);
});

test("rejects short and malformed prayer requests", () => {
  const result = prayerRequestSchema.safeParse({ title: "Duo", body: "Qisqa", category: "unknown" });
  assert.equal(result.success, false);
});

test("routes high-risk language to human moderation", () => {
  const result = moderateText("O‘zimni o‘ldirish haqida o‘ylayapman");
  assert.equal(result.highRisk, true);
  assert.equal(result.status, "pending_moderation");
});

test("flags likely personal phone numbers", () => {
  const result = moderateText("Menga +998 90 123 45 67 orqali yozing");
  assert.equal(result.containsPii, true);
  assert.equal(result.status, "pending_moderation");
});

test("never exposes an anonymous author", () => {
  assert.equal(safePublicAuthor(true, "Real Name"), "Duodosh a’zosi");
  assert.equal(safePublicAuthor(false, "Aziza"), "Aziza");
});

test("prioritizes urgent safety reports", () => {
  assert.equal(reportSchema.safeParse({ targetType: "prayer_request", targetId: "pr_123", reason: "self_harm" }).success, true);
  assert.equal(reportSchema.safeParse({ targetType: "profile", targetId: "x", reason: "other" }).success, false);
});

test("validates mosque applications and referral actions", () => {
  assert.equal(mosqueApplicationSchema.safeParse({ name: "Minor masjidi", city: "Toshkent", country: "O‘zbekiston", evidence: "Rasmiy vakil hujjati raqami" }).success, true);
  assert.equal(referralActionSchema.safeParse({ action: "included_in_prayer" }).success, true);
  assert.equal(referralActionSchema.safeParse({ action: "delete" }).success, false);
});

test("sorts nearby map places by real geographic distance", () => {
  const places = normalizeOverpassPlaces([
    { type: "node", id: 2, lat: 41.32, lon: 69.28, tags: { amenity: "ablution" } },
    { type: "node", id: 1, lat: 41.312, lon: 69.28, tags: { amenity: "place_of_worship", religion: "muslim", name: "Sinov masjidi" } },
  ], 41.3111, 69.2797);
  assert.equal(places[0].name, "Sinov masjidi");
  assert.equal(places[1].type, "ablution");
  assert.ok(distanceInMeters(41.3111, 69.2797, 41.312, 69.28) < 150);
});
