import assert from "node:assert/strict";
import test from "node:test";
import { moderateText, prayerRequestSchema, safePublicAuthor } from "../lib/product.ts";

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
