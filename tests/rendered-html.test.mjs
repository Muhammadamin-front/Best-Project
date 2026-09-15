import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  page: new URL("../app/page.tsx", import.meta.url),
  app: new URL("../app/components/DuodoshApp.tsx", import.meta.url),
  welcome: new URL("../app/components/WelcomeView.tsx", import.meta.url),
  componentsConfig: new URL("../components.json", import.meta.url),
  demo: new URL("../lib/demo-data.ts", import.meta.url),
  css: new URL("../app/globals.css", import.meta.url),
  layout: new URL("../app/layout.tsx", import.meta.url),
  map: new URL("../app/components/NearbyMap.tsx", import.meta.url),
  nearbyApi: new URL("../app/api/places/nearby/route.ts", import.meta.url),
  aurora: new URL("../components/ui/aurora-background.tsx", import.meta.url),
  sonar: new URL("../components/ui/sonar-grid.tsx", import.meta.url),
  commentsApi: new URL("../app/api/requests/[id]/comments/route.ts", import.meta.url),
  resolveApi: new URL("../app/api/requests/[id]/resolve/route.ts", import.meta.url),
  notificationsApi: new URL("../app/api/notifications/route.ts", import.meta.url),
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

test("opens with a guided faith-based welcome and top navigation", async () => {
  const [app, welcome, css] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(files.welcome, "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(app, /useState<View>\("welcome"\)/);
  assert.match(app, /className="site-navbar"/);
  assert.doesNotMatch(app, /className="sidebar"/);
  assert.match(welcome, /Sahih Muslim, 2732a/);
  assert.match(welcome, /Hashr surasi, 59:10/);
  assert.match(welcome, /Yunus alayhissalom duosi/);
  assert.match(welcome, /Muso alayhissalom duosi/);
  assert.match(welcome, /Ibrohim alayhissalom duosi/);
  assert.match(welcome, /Zakariyo alayhissalom duosi/);
  assert.equal((welcome.match(/reading:/g) || []).length, 4);
  assert.match(welcome, /O‘qilishi:<\/span> Da’a li-axihi bi-zahril-g‘aybi/);
  assert.match(welcome, /O‘qilishi:<\/span> Robbana, ig‘fir lana/);
  assert.match(css, /\.welcome-hero/);
  assert.match(css, /\.navbar-links/);
  assert.match(css, /\.transliteration/);
  assert.match(app, /className=\{`mobile-menu-toggle\$\{menuOpen \? " open" : ""\}`\}/);
  assert.match(app, /aria-expanded=\{menuOpen\}/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(css, /\.navbar-links\.open/);
  assert.match(css, /\.mobile-menu-backdrop/);
});

test("keeps shadcn paths aligned with the existing Tailwind 4 project", async () => {
  const config = JSON.parse(await readFile(files.componentsConfig, "utf8"));
  assert.equal(config.tsx, true);
  assert.equal(config.tailwind.css, "app/globals.css");
  assert.equal(config.aliases.ui, "@/components/ui");
  assert.equal(config.aliases.utils, "@/lib/utils");
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

test("layers a reduced-motion-friendly aurora behind the sonar grid", async () => {
  const [layout, aurora, css] = await Promise.all([
    readFile(files.layout, "utf8"),
    readFile(files.aurora, "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(layout, /<AuroraBackground/);
  assert.match(layout, /global-aurora-backdrop/);
  assert.match(aurora, /showRadialGradient/);
  assert.match(aurora, /from "framer-motion"/);
  assert.match(aurora, /useReducedMotion/);
  assert.match(aurora, /aurora-background__lights--radial/);
  assert.match(css, /@keyframes aurora/);
  assert.match(css, /\.global-sonar-backdrop[^}]*z-index: 1/);
  assert.match(css, /prefers-reduced-motion/);
});

test("connects prayer cards to moderated support comments", async () => {
  const [app, commentsApi, requestsApi, css] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(files.commentsApi, "utf8"),
    readFile(new URL("../app/api/requests/route.ts", import.meta.url), "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(app, /function CommentPanel/);
  assert.match(app, /function QuickCommentForm/);
  assert.match(app, /className="quick-comment"/);
  assert.match(app, /\/api\/requests\/\$\{target\.id\}\/comments/);
  assert.match(app, /\/api\/requests\/\$\{request\.id\}\/comments/);
  assert.match(app, /onCommentPublished/);
  assert.match(app, /commentGuidance/);
  assert.match(css, /\.quick-comment/);
  assert.match(commentsApi, /moderateText\(parsed\.data\.body\)/);
  assert.match(commentsApi, /support_comment/);
  assert.match(requestsApi, /commentCount:/);
});

test("renders persistent notifications with unread controls", async () => {
  const [app, notificationsApi, css] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(files.notificationsApi, "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(app, /function NotificationsView/);
  assert.match(app, /fetch\("\/api\/notifications"\)/);
  assert.match(app, /notificationMarkAll/);
  assert.match(notificationsApi, /export async function PATCH/);
  assert.match(notificationsApi, /isNull\(notifications\.readAt\)/);
  assert.match(css, /\.notification-list article\.unread/);
});

test("loads, edits, and persists the signed-in profile", async () => {
  const [app, meApi, css] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(new URL("../app/api/me/route.ts", import.meta.url), "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(app, /method: "PATCH"/);
  assert.match(app, /Profil ma’lumotlari/);
  assert.match(app, /stats\?\.supportToday/);
  assert.match(meApi, /export async function PATCH/);
  assert.match(meApi, /profileUpdateSchema/);
  assert.match(meApi, /preferredLanguage: next\.preferredLanguage/);
  assert.match(css, /\.profile-editor/);
});

test("lets request owners resolve a prayer and notify its supporters", async () => {
  const [app, requestsApi, resolveApi, css] = await Promise.all([
    readFile(files.app, "utf8"),
    readFile(new URL("../app/api/requests/route.ts", import.meta.url), "utf8"),
    readFile(files.resolveApi, "utf8"),
    readFile(files.css, "utf8"),
  ]);
  assert.match(app, /function ResolveDialog/);
  assert.match(app, /\/api\/requests\/\$\{target\.id\}\/resolve/);
  assert.match(app, /request\.owned/);
  assert.match(requestsApi, /ownedByViewer/);
  assert.match(requestsApi, /resolvedAt/);
  assert.match(resolveApi, /Only the request owner can resolve it/);
  assert.match(resolveApi, /request_resolved/);
  assert.match(resolveApi, /db\.batch/);
  assert.match(css, /\.resolve-dialog/);
  assert.match(css, /\.resolved-badge/);
});
