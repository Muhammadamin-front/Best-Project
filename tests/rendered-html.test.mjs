import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  page: new URL("../app/page.tsx", import.meta.url),
  app: new URL("../app/components/DuodoshApp.tsx", import.meta.url),
  demo: new URL("../lib/demo-data.ts", import.meta.url),
  css: new URL("../app/globals.css", import.meta.url),
  layout: new URL("../app/layout.tsx", import.meta.url),
  map: new URL("../app/components/NearbyMap.tsx", import.meta.url),
  nearbyApi: new URL("../app/api/places/nearby/route.ts", import.meta.url),
  sonar: new URL("../components/ui/sonar-grid.tsx", import.meta.url),
  commentsApi: new URL("../app/api/requests/[id]/comments/route.ts", import.meta.url),
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

test("includes privacy-conscious nearby mosque and ablution mapping", async () => {
  const [app, map, nearbyApi, layout] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(files.map, "utf8"),
    readFile(files.nearbyApi, "utf8"),
    readFile(files.layout, "utf8"),
  ]);
  assert.match(app, /<NearbyMap \/>/);
  assert.match(map, /Joylashuvimni aniqlash/);
  assert.match(map, /Joylashuvingiz Duodosh bazasida saqlanmaydi/);
  assert.match(map, /openstreetmap\.org\/directions/);
  assert.match(nearbyApi, /"amenity"="place_of_worship"/);
  assert.match(nearbyApi, /"amenity"="ablution"/);
  assert.match(layout, /leaflet\/dist\/leaflet\.css/);
});

test("uses the interactive sonar grid across the whole site", async () => {
  const [layout, sonar, css] = await Promise.all([
    readFile(files.layout, "utf8"),
    readFile(files.sonar, "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(layout, /<SonarGrid/);
  assert.match(layout, /interactionTarget="window"/);
  assert.match(sonar, /prefers-reduced-motion/);
  assert.match(sonar, /ResizeObserver/);
  assert.match(css, /\.global-sonar-backdrop/);
  assert.match(css, /\.site-layer/);
});

test("connects prayer cards to moderated support comments", async () => {
  const [app, commentsApi, requestsApi] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(files.commentsApi, "utf8"),
    readFile(new URL("../app/api/requests/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(app, /function CommentPanel/);
  assert.match(app, /\/api\/requests\/\$\{target\.id\}\/comments/);
  assert.match(app, /commentGuidance/);
  assert.match(commentsApi, /moderateText\(parsed\.data\.body\)/);
  assert.match(commentsApi, /support_comment/);
  assert.match(requestsApi, /commentCount:/);
});
