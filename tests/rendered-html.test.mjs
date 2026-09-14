import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  page: new URL("../app/page.tsx", import.meta.url),
  app: new URL("../app/components/DuodoshApp.tsx", import.meta.url),
  demo: new URL("../lib/demo-data.ts", import.meta.url),
  css: new URL("../app/globals.css", import.meta.url),
  layout: new URL("../app/layout.tsx", import.meta.url),
};

test("ships the Duodosh product rather than the starter", async () => {
  const [page, app, layout, demo] = await Promise.all([
    readFile(files.page, "utf8"),
    readFile(files.app, "utf8"),
    readFile(files.layout, "utf8"),
    readFile(files.demo, "utf8"),
  ]);
  assert.match(page, /<DuodoshApp viewerName=/);
  assert.match(layout, /Duodosh — duoda birgamiz/);
  assert.match(app, /Assalomu alaykum, Aziza/);
  assert.match(demo, /Onamning operatsiyasi uchun duo qiling/);
  assert.match(app, /Masjid bilan bog‘lanish/);
  assert.doesNotMatch(`${page}${app}${layout}`, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("includes privacy, localization, and accessibility affordances", async () => {
  const [app, css] = await Promise.all([readFile(files.app, "utf8"), readFile(files.css, "utf8")]);
  assert.match(app, /aria-label="Asosiy navigatsiya"/);
  assert.match(app, /Anonim duodosh/);
  assert.match(app, /Xavfsiz hamjamiyat/);
  assert.match(app, /type Language = "uz" \| "en" \| "ru"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 760px\)/);
});

test("includes protected operations dashboards", async () => {
  const [moderation, mosque, auth] = await Promise.all([
    readFile(new URL("../app/moderation/ModerationDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mosque-dashboard/MosqueDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/server-auth.ts", import.meta.url), "utf8"),
  ]);
  assert.match(moderation, /\/api\/moderation\/queue/);
  assert.match(moderation, /Ruxsat yetarli emas/);
  assert.match(mosque, /\/api\/mosques\/\$\{mosqueId\}\/referrals/);
  assert.match(mosque, /Vakillik tasdig‘i kerak/);
  assert.match(auth, /DUODOSH_ADMIN_EMAILS/);
});
