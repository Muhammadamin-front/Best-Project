"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { categories, type PrayerRequestInput } from "../../lib/product";
import { demoRequests, type PrayerCard } from "../../lib/demo-data";
import NearbyMap from "./NearbyMap";

type Language = "uz" | "en" | "ru";
type View = "feed" | "saved" | "mine" | "mosque" | "notifications" | "profile";
type SupportComment = { id: string; body: string; author: string | null; createdAt: string };

const copy = {
  uz: {
    nav: { feed: "Duo oqimi", saved: "Saqlangan", mine: "Mening so‘rovlarim", mosque: "Masjidlar", notifications: "Bildirishnomalar", profile: "Profil" },
    greeting: "Assalomu alaykum, Aziza",
    subtitle: "Bugun kimnidir duoda eslash uchun go‘zal kun.",
    search: "Niyatlar orasidan qidirish…",
    newRequest: "Duo so‘rash",
    filters: ["Barchasi", "Javobsiz", "Yaqinimda", "Sog‘liq", "Oila", "Ish va ta’lim"],
    prayer: "Duo qildim",
    prayed: "Duo qilindi",
    save: "Saqlash",
    saved: "Saqlandi",
    support: "dalda",
    commentTitle: "Mehrli dalda",
    commentIntro: "Duo so‘ragan insonni yolg‘iz emasligini his qildiring.",
    commentPlaceholder: "Samimiy va qisqa dalda yozing…",
    commentSend: "Yuborish",
    commentEmpty: "Hali dalda yozilmagan. Birinchi mehrli so‘zni siz qoldiring.",
    commentLoading: "Daldalar yuklanmoqda…",
    commentGuidance: "Hukm qilmang, tibbiy yoki diniy fatvo bermang. Telefon va aniq manzil yozmang.",
    commentPending: "Xabaringiz xavfsizlik tekshiruviga yuborildi.",
    dailyTitle: "Bugungi niyat",
    dailyText: "Kamida uch insonni samimiy duoda eslang. Har bir so‘rov ortida haqiqiy inson bor.",
    progress: "duo qilindi",
    mosqueTitle: "Masjid bilan bog‘lanish",
    mosqueText: "Roziligingiz bilan so‘rovingiz tasdiqlangan mahalliy masjidga yuborilishi mumkin.",
    learn: "Qanday ishlaydi?",
    safety: "Xavfsiz hamjamiyat",
    safetyText: "Bu yer hukmsiz, mehrli va maxfiy ko‘mak uchun yaratilgan.",
    composerTitle: "Duo so‘rovi yozing",
    composerSubtitle: "Samimiy yozing. Shaxsiy telefon, aniq manzil yoki hujjat raqamini kiritmang.",
    titleLabel: "Qisqa sarlavha",
    titlePlaceholder: "Masalan: Onamning sog‘ligi uchun",
    bodyLabel: "Nima uchun duo so‘raysiz?",
    bodyPlaceholder: "Vaziyatingizni qisqacha tushuntiring…",
    category: "Mavzu",
    city: "Shahar (ixtiyoriy)",
    anonymous: "Anonim ulashish",
    anonymousHelp: "Ismingiz hamjamiyatga ko‘rsatilmaydi.",
    mosqueConsent: "Mahalliy masjidga yuborishga roziman",
    emergency: "Bu shoshilinch va juda og‘ir holat",
    emergencyHelp: "Shoshilinch so‘rovlar avval inson moderatori tomonidan ko‘riladi.",
    publish: "Ko‘rib chiqishga yuborish",
    cancel: "Bekor qilish",
    gateTitle: "Avval mehr ulashing",
    gateText: "Oddiy so‘rov yuborishdan oldin 3 ta turli insonni duoda eslang. Izoh yozish shart emas.",
    continueEmergency: "Shoshilinch so‘rov yozish",
    backFeed: "Duo oqimiga qaytish",
    emptySaved: "Hali duo ro‘yxatingiz bo‘sh",
    emptySavedText: "Keyinroq eslashni istagan niyatlaringizni saqlang.",
    successTitle: "So‘rovingiz qabul qilindi",
    successText: "Hamjamiyat xavfsizligi uchun so‘rov qisqa tekshiruvdan o‘tadi.",
    resolved: "Alhamdulillah, hal bo‘ldi",
  },
  en: {
    nav: { feed: "Prayer feed", saved: "Saved", mine: "My requests", mosque: "Mosques", notifications: "Notifications", profile: "Profile" },
    greeting: "Assalamu alaikum, Aziza",
    subtitle: "Today is a beautiful day to remember someone in prayer.", search: "Search prayer requests…", newRequest: "Ask for prayer",
    filters: ["All", "Unanswered", "Near me", "Health", "Family", "Work & study"], prayer: "I prayed for you", prayed: "Prayer offered", save: "Save", saved: "Saved", support: "supports",
    commentTitle: "Kind support", commentIntro: "Help the person asking for prayer feel that they are not alone.", commentPlaceholder: "Write a sincere, brief message…", commentSend: "Send", commentEmpty: "No support yet. You can leave the first kind message.", commentLoading: "Loading messages…", commentGuidance: "Do not judge or give medical or religious rulings. Do not share phone numbers or exact addresses.", commentPending: "Your message was sent for a safety review.",
    dailyTitle: "Today’s intention", dailyText: "Remember at least three people sincerely. A real person is behind every request.", progress: "prayers offered",
    mosqueTitle: "Connect with a mosque", mosqueText: "With your consent, a request can be shared with a verified local mosque.", learn: "How does it work?", safety: "A safe community", safetyText: "A private, compassionate space without judgment.",
    composerTitle: "Write a prayer request", composerSubtitle: "Write sincerely. Do not include a phone number, exact address, or document number.", titleLabel: "Short title", titlePlaceholder: "For example: For my mother’s health", bodyLabel: "What should we pray for?", bodyPlaceholder: "Briefly explain your situation…", category: "Category", city: "City (optional)", anonymous: "Share anonymously", anonymousHelp: "Your name will not be shown publicly.", mosqueConsent: "I consent to sharing with a local mosque", emergency: "This is an urgent, highly sensitive situation", emergencyHelp: "Urgent requests are reviewed by a human moderator first.", publish: "Send for review", cancel: "Cancel", gateTitle: "Share compassion first", gateText: "Before a normal request, remember 3 different people in prayer. A comment is never required.", continueEmergency: "Write an urgent request", backFeed: "Return to prayer feed", emptySaved: "Your prayer list is empty", emptySavedText: "Save intentions you want to remember later.", successTitle: "Your request was received", successText: "It will receive a brief safety review before appearing.", resolved: "Alhamdulillah, resolved",
  },
  ru: {
    nav: { feed: "Лента дуа", saved: "Сохранённые", mine: "Мои просьбы", mosque: "Мечети", notifications: "Уведомления", profile: "Профиль" },
    greeting: "Ассаляму алейкум, Азиза", subtitle: "Сегодня прекрасный день, чтобы вспомнить кого-то в дуа.", search: "Поиск просьб…", newRequest: "Попросить дуа",
    filters: ["Все", "Без ответа", "Рядом", "Здоровье", "Семья", "Работа и учёба"], prayer: "Я сделал дуа", prayed: "Дуа сделано", save: "Сохранить", saved: "Сохранено", support: "поддержки",
    commentTitle: "Добрая поддержка", commentIntro: "Дайте человеку почувствовать, что он не одинок.", commentPlaceholder: "Напишите короткие искренние слова…", commentSend: "Отправить", commentEmpty: "Поддержки пока нет. Оставьте первое доброе сообщение.", commentLoading: "Загрузка сообщений…", commentGuidance: "Не осуждайте и не давайте медицинских или религиозных заключений. Не указывайте телефон и точный адрес.", commentPending: "Сообщение отправлено на проверку безопасности.",
    dailyTitle: "Намерение дня", dailyText: "Искренне вспомните в дуа хотя бы трёх людей. За каждой просьбой стоит человек.", progress: "дуа сделано", mosqueTitle: "Связаться с мечетью", mosqueText: "С вашего согласия просьба может быть передана проверенной местной мечети.", learn: "Как это работает?", safety: "Безопасное сообщество", safetyText: "Приватное и доброе пространство без осуждения.", composerTitle: "Напишите просьбу о дуа", composerSubtitle: "Не указывайте телефон, точный адрес или номер документа.", titleLabel: "Краткий заголовок", titlePlaceholder: "Например: За здоровье мамы", bodyLabel: "О чём сделать дуа?", bodyPlaceholder: "Кратко опишите ситуацию…", category: "Тема", city: "Город (необязательно)", anonymous: "Опубликовать анонимно", anonymousHelp: "Ваше имя не будет показано.", mosqueConsent: "Согласен передать местной мечети", emergency: "Это срочная и тяжёлая ситуация", emergencyHelp: "Срочные просьбы сначала проверяет модератор.", publish: "Отправить на проверку", cancel: "Отмена", gateTitle: "Сначала поделитесь заботой", gateText: "Перед обычной просьбой вспомните в дуа 3 разных людей. Комментарий не обязателен.", continueEmergency: "Написать срочную просьбу", backFeed: "Вернуться в ленту", emptySaved: "Ваш список дуа пока пуст", emptySavedText: "Сохраните намерения, которые хотите вспомнить позже.", successTitle: "Просьба принята", successText: "Она пройдёт краткую проверку безопасности.", resolved: "Альхамдулиллях, решено",
  },
} as const;

const categoryLabels: Record<string, Record<Language, string>> = {
  health: { uz: "Sog‘liq", en: "Health", ru: "Здоровье" }, family: { uz: "Oila", en: "Family", ru: "Семья" }, grief: { uz: "Musibat", en: "Grief", ru: "Утрата" }, work: { uz: "Ish va ta’lim", en: "Work & study", ru: "Работа и учёба" }, livelihood: { uz: "Rizq", en: "Livelihood", ru: "Благосостояние" }, emotional: { uz: "Ruhiy holat", en: "Emotional", ru: "Душевное состояние" }, general: { uz: "Umumiy", en: "General", ru: "Общее" }, other: { uz: "Boshqa", en: "Other", ru: "Другое" },
};

function Mark({ size = "normal" }: { size?: "normal" | "small" }) {
  return <span className={`brand-mark ${size}`} aria-hidden="true"><span>☾</span><i>•</i></span>;
}

export default function DuodoshApp({ viewerName }: { viewerName: string }) {
  const [language, setLanguage] = useState<Language>("uz");
  const [view, setView] = useState<View>("feed");
  const [requests, setRequests] = useState<PrayerCard[]>(demoRequests);
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commentTarget, setCommentTarget] = useState<PrayerCard | null>(null);
  const [notice, setNotice] = useState("");
  const t = copy[language];
  const supportToday = requests.filter((request) => request.supported).length;
  const firstName = viewerName.trim().split(/\s+/)[0] || "Duodosh";
  const initial = firstName.slice(0, 1).toUpperCase();

  useEffect(() => {
    let active = true;
    void fetch("/api/requests")
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error("Feed unavailable")))
      .then((payload: { requests?: Array<Record<string, unknown>> }) => {
        if (!active || !payload.requests?.length) return;
        setRequests(payload.requests.map((item) => ({
          id: String(item.id), author: String(item.author || "Duodosh a’zosi"), avatar: String(item.author || "D").slice(0, 1).toUpperCase(),
          title: String(item.title), body: String(item.body), category: String(item.category), categoryKey: String(item.category), city: String(item.city || "O‘zbekiston"),
          time: "Yaqinda", supportCount: Number(item.supportCount || 0), commentCount: Number(item.commentCount || 0), supported: Boolean(item.supported), saved: Boolean(item.saved),
          anonymous: Boolean(item.isAnonymous), urgent: Boolean(item.isEmergency),
        })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const visibleRequests = useMemo(() => {
    let next = view === "saved" ? requests.filter((item) => item.saved) : view === "mine" ? requests.filter((item) => item.id.startsWith("local-")) : requests;
    if (filter === 1) next = next.filter((item) => item.supportCount < 10);
    if (filter === 2) next = next.filter((item) => ["Toshkent", "Samarqand"].includes(item.city));
    if (filter >= 3) {
      const keys = ["health", "family", "work"];
      next = next.filter((item) => item.categoryKey === keys[filter - 3]);
    }
    const query = search.trim().toLowerCase();
    return query ? next.filter((item) => `${item.title} ${item.body} ${item.city}`.toLowerCase().includes(query)) : next;
  }, [requests, view, filter, search]);

  function toggleSupport(target: PrayerCard) {
    setRequests((items) => items.map((item) => item.id === target.id ? { ...item, supported: !item.supported, supportCount: item.supportCount + (item.supported ? -1 : 1) } : item));
    setNotice(target.supported ? "Duo belgisi olib tashlandi" : "Alloh duoyingizni qabul qilsin");
    window.setTimeout(() => setNotice(""), 2400);
    if (!target.id.startsWith("local-")) void fetch(`/api/requests/${target.id}/support`, { method: "POST" });
  }

  function toggleSave(target: PrayerCard) {
    setRequests((items) => items.map((item) => item.id === target.id ? { ...item, saved: !item.saved } : item));
    if (!target.id.startsWith("local-")) void fetch(`/api/requests/${target.id}/save`, { method: "POST" });
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categoryKey = String(form.get("category") || "general");
    const payload: PrayerRequestInput = {
      title: String(form.get("title")), body: String(form.get("body")), category: categoryKey as PrayerRequestInput["category"], language,
      city: String(form.get("city") || ""), country: "O‘zbekiston", isAnonymous: form.get("anonymous") === "on", visibility: "public",
      mosqueReferralConsent: form.get("mosque") === "on", isEmergency: emergencyOverride || form.get("emergency") === "on",
    };
    const localId = `local-${Date.now()}`;
    const newCard: PrayerCard = { id: localId, author: payload.isAnonymous ? "Anonim duodosh" : firstName, avatar: payload.isAnonymous ? "D" : initial, title: payload.title, body: payload.body, category: categoryLabels[categoryKey][language], categoryKey, city: payload.city || "O‘zbekiston", time: "Hozirgina", supportCount: 0, commentCount: 0, supported: false, saved: false, anonymous: payload.isAnonymous, urgent: payload.isEmergency };
    setRequests((items) => [newCard, ...items]);
    setSubmitted(true);
    void fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error("Create failed")))
      .then((result: { id?: string; status?: string }) => {
        if (result.id) setRequests((items) => items.map((item) => item.id === localId ? { ...item, id: result.id as string, urgent: result.status === "pending_moderation" } : item));
      })
      .catch(() => undefined);
  }

  const navItems: { key: View; icon: string }[] = [
    { key: "feed", icon: "⌂" }, { key: "saved", icon: "♡" }, { key: "mine", icon: "◫" }, { key: "mosque", icon: "⌒" }, { key: "notifications", icon: "♢" }, { key: "profile", icon: "○" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Duodosh bosh sahifa"><Mark /><span>duodosh</span></a>
        <nav aria-label="Asosiy navigatsiya">
          {navItems.map(({ key, icon }) => <button key={key} className={view === key ? "nav-item active" : "nav-item"} onClick={() => setView(key)}><span className="nav-icon">{icon}</span><span>{t.nav[key]}</span>{key === "notifications" && <b className="notification-dot">2</b>}</button>)}
        </nav>
        <div className="sidebar-kindness">
          <span className="tiny-moon">☾</span>
          <strong>{t.dailyTitle}</strong>
          <p>“Bir-biringizni duoda unutmang.”</p>
        </div>
        <button className="user-card" onClick={() => setView("profile")}><span className="avatar coral">{initial}</span><span><b>{viewerName}</b><small>Toshkent, O‘zbekiston</small></span><span>•••</span></button>
      </aside>

      <main className="main" id="top">
        <header className="topbar">
          <div className="mobile-brand"><Mark size="small" /><b>duodosh</b></div>
          <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} aria-label={t.search} /></label>
          <div className="top-actions"><select value={language} onChange={(e) => setLanguage(e.target.value as Language)} aria-label="Til"><option value="uz">UZ</option><option value="en">EN</option><option value="ru">RU</option></select><button className="icon-button" aria-label={t.nav.notifications} onClick={() => setView("notifications")}>♢<i>2</i></button><button className="avatar coral small" onClick={() => setView("profile")}>{initial}</button></div>
        </header>

        <div className="content-grid">
          <section className="feed-column">
            <div className="welcome-row"><div><p className="eyebrow">DUODA BIRGAMIZ</p><h1>{view === "saved" ? t.nav.saved : view === "mine" ? t.nav.mine : `${language === "ru" ? "Ассаляму алейкум" : language === "en" ? "Assalamu alaikum" : "Assalomu alaykum"}, ${firstName}`}</h1><p>{view === "feed" ? t.subtitle : view === "saved" ? t.emptySavedText : "Siz ulashgan niyatlar shu yerda saqlanadi."}</p></div><button className="primary-button" onClick={() => { setComposerOpen(true); setSubmitted(false); setEmergencyOverride(false); }}><span>＋</span>{t.newRequest}</button></div>

            {(view === "feed" || view === "saved" || view === "mine") && <>
              <div className="filter-row" role="tablist" aria-label="Filtrlar">{t.filters.map((label, index) => <button key={label} className={filter === index ? "filter active" : "filter"} onClick={() => setFilter(index)}>{label}</button>)}</div>
              <div className="request-list">
                {visibleRequests.map((request) => <PrayerRequestCard key={request.id} request={request} t={t} language={language} onSupport={() => toggleSupport(request)} onSave={() => toggleSave(request)} onComment={() => setCommentTarget(request)} />)}
                {visibleRequests.length === 0 && <div className="empty-state"><span>♡</span><h2>{t.emptySaved}</h2><p>{t.emptySavedText}</p><button className="soft-button" onClick={() => setView("feed")}>{t.backFeed}</button></div>}
              </div>
            </>}
            {view === "mosque" && <MosqueView />}
            {view === "notifications" && <NotificationsView />}
            {view === "profile" && <ProfileView viewerName={viewerName} initial={initial} />}
          </section>

          <aside className="right-rail">
            <div className="daily-card">
              <div className="card-icon green">☾</div><h2>{t.dailyTitle}</h2><p>{t.dailyText}</p>
              <div className="progress-label"><span>{Math.min(supportToday, 3)} / 3 {t.progress}</span><b>{Math.round(Math.min(supportToday / 3, 1) * 100)}%</b></div>
              <div className="progress-track"><i style={{ width: `${Math.min(supportToday / 3, 1) * 100}%` }} /></div>
              <small>Bugun, 14-sentabr</small>
            </div>
            <div className="mosque-card"><div className="mosque-art" aria-hidden="true"><span>☾</span><div>⌒</div></div><h2>{t.mosqueTitle}</h2><p>{t.mosqueText}</p><button onClick={() => setView("mosque")}>{t.learn}<span>→</span></button></div>
            <div className="safety-card"><span>♢</span><div><h3>{t.safety}</h3><p>{t.safetyText}</p></div></div>
            <div className="footer-links"><a href="#community">Hamjamiyat qoidalari</a><a href="#privacy">Maxfiylik</a><a href="#help">Yordam</a><small>© 2026 Duodosh</small></div>
          </aside>
        </div>

        <nav className="mobile-nav" aria-label="Mobil navigatsiya">{navItems.slice(0, 5).map(({ key, icon }) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><span>{icon}</span><small>{t.nav[key].split(" ")[0]}</small></button>)}</nav>
        <button className="mobile-compose" aria-label={t.newRequest} onClick={() => { setComposerOpen(true); setSubmitted(false); }}>＋</button>
      </main>

      {composerOpen && <Composer t={t} language={language} eligible={supportToday >= 3 || emergencyOverride} emergencyOverride={emergencyOverride} onEmergency={() => setEmergencyOverride(true)} onClose={() => setComposerOpen(false)} onSubmit={submitRequest} submitted={submitted} />}
      {commentTarget && <CommentPanel key={commentTarget.id} target={commentTarget} t={t} language={language} viewerName={viewerName} initial={initial} onClose={() => setCommentTarget(null)} onPublished={() => setRequests((items) => items.map((item) => item.id === commentTarget.id ? { ...item, commentCount: item.commentCount + 1 } : item))} />}
      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    </div>
  );
}

function PrayerRequestCard({ request, t, language, onSupport, onSave, onComment }: { request: PrayerCard; t: typeof copy[Language]; language: Language; onSupport: () => void; onSave: () => void; onComment: () => void }) {
  return <article className="request-card">
    <div className="request-head"><span className={`avatar ${request.anonymous ? "sage" : "amber"}`}>{request.avatar}</span><div><b>{request.author}</b><p><span>{request.city}</span><i>•</i><span>{request.time}</span></p></div><button aria-label="Ko‘proq">•••</button></div>
    <div className="request-body"><div className="badges"><span className={`category ${request.categoryKey}`}>{categoryLabels[request.categoryKey]?.[language] || request.category}</span>{request.urgent && <span className="urgent">Moderator tekshiruvida</span>}</div><h2>{request.title}</h2><p>{request.body}</p></div>
    <div className="request-stats"><span><b>{request.supportCount}</b> inson duoda esladi</span><span>{request.commentCount} {t.support}</span></div>
    <div className="request-actions"><button className={request.supported ? "pray active" : "pray"} onClick={onSupport}><span>{request.supported ? "✓" : "☾"}</span>{request.supported ? t.prayed : t.prayer}</button><button className={request.saved ? "save active" : "save"} onClick={onSave}><span>{request.saved ? "♥" : "♡"}</span>{request.saved ? t.saved : t.save}</button><button className="comment" aria-label={t.commentTitle} onClick={onComment}><span>◯</span>{t.commentTitle}</button></div>
  </article>;
}

function CommentPanel({ target, t, language, viewerName, initial, onClose, onPublished }: { target: PrayerCard; t: typeof copy[Language]; language: Language; viewerName: string; initial: string; onClose: () => void; onPublished: () => void }) {
  const [comments, setComments] = useState<SupportComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let active = true;
    void fetch(`/api/requests/${target.id}/comments`)
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error("Comments unavailable")))
      .then((payload: { comments?: SupportComment[] }) => {
        if (active) setComments(payload.comments ?? []);
      })
      .catch(() => active && setMessage("Daldalarni yuklab bo‘lmadi. Qayta urinib ko‘ring."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [target.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") || "").trim();
    if (body.length < 2) return;
    setSending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/requests/${target.id}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
      const result = await response.json() as { id?: string; status?: string; author?: string; body?: string; createdAt?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Comment failed");
      if (result.status === "published" && result.id) {
        setComments((items) => [...items, { id: result.id as string, body: result.body || body, author: result.author || viewerName, createdAt: result.createdAt || new Date().toISOString() }]);
        onPublished();
        form.reset();
        setDraft("");
        setMessage(language === "uz" ? "Daldangiz yetib bordi. Alloh rozi bo‘lsin." : language === "en" ? "Your support was delivered. Thank you." : "Ваши слова поддержки отправлены.");
      } else {
        form.reset();
        setDraft("");
        setMessage(t.commentPending);
      }
    } catch (error) {
      const signedOut = error instanceof Error && /Authentication required/i.test(error.message);
      setMessage(signedOut ? "Dalda yozish uchun ChatGPT hisobingiz bilan kiring." : "Xabar yuborilmadi. Birozdan keyin qayta urinib ko‘ring.");
    } finally {
      setSending(false);
    }
  }

  const locale = language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US";
  return <div className="comment-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="comment-panel" role="dialog" aria-modal="true" aria-labelledby="comment-panel-title">
      <header><div><p className="eyebrow">{target.category}</p><h2 id="comment-panel-title">{t.commentTitle}</h2></div><button onClick={onClose} aria-label="Yopish">×</button></header>
      <div className="comment-request"><span className={`avatar ${target.anonymous ? "sage" : "amber"}`}>{target.avatar}</span><div><b>{target.title}</b><p>{target.author} · {target.city}</p></div></div>
      <p className="comment-intro">{t.commentIntro}</p>
      <div className="comment-stream" aria-live="polite">
        {loading && <div className="comment-empty">{t.commentLoading}</div>}
        {!loading && comments.length === 0 && <div className="comment-empty"><span>♡</span><p>{t.commentEmpty}</p></div>}
        {comments.map((comment) => <article key={comment.id}><span className="avatar sage">{(comment.author || "D").slice(0, 1).toUpperCase()}</span><div><div><b>{comment.author || "Duodosh a’zosi"}</b><time>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(comment.createdAt))}</time></div><p>{comment.body}</p></div></article>)}
      </div>
      <form className="comment-form" onSubmit={submitComment}>
        <div className="comment-author"><span className="avatar coral">{initial}</span><span><b>{viewerName}</b><small>{t.commentGuidance}</small></span></div>
        <textarea name="body" minLength={2} maxLength={600} required rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t.commentPlaceholder} aria-label={t.commentPlaceholder} />
        {message && <p className="comment-message" role="status">{message}</p>}
        <div><span><b>{draft.length}</b> / 600</span><button className="primary-button" type="submit" disabled={sending || draft.trim().length < 2}>{sending ? "…" : t.commentSend}<span>→</span></button></div>
      </form>
    </aside>
  </div>;
}

function Composer({ t, language, eligible, emergencyOverride, onEmergency, onClose, onSubmit, submitted }: { t: typeof copy[Language]; language: Language; eligible: boolean; emergencyOverride: boolean; onEmergency: () => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitted: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
    <button className="modal-close" onClick={onClose} aria-label="Yopish">×</button>
    {submitted ? <div className="success-state"><span>✓</span><h2>{t.successTitle}</h2><p>{t.successText}</p><button className="primary-button" onClick={onClose}>{t.backFeed}</button></div> : !eligible ? <div className="gate-state"><span className="gate-icon">♡</span><p className="eyebrow">DUODOSH TAMOYILI</p><h2>{t.gateTitle}</h2><p>{t.gateText}</p><div className="gate-progress"><i /><i /><i /></div><button className="primary-button" onClick={onClose}>{t.backFeed}</button><button className="link-button" onClick={onEmergency}>{t.continueEmergency} →</button></div> : <form onSubmit={onSubmit}>
      <p className="eyebrow">NIYATINGIZNI ULASHING</p><h2 id="composer-title">{t.composerTitle}</h2><p className="form-intro">{t.composerSubtitle}</p>
      {emergencyOverride && <div className="safety-alert"><b>Hozir xavf bormi?</b><p>Agar siz yoki boshqa inson hozir xavfda bo‘lsa, mahalliy tez yordamga yoki ishonchli yaqiningizga darhol murojaat qiling. Duodosh favqulodda xizmat emas.</p></div>}
      <label>{t.titleLabel}<input name="title" minLength={4} maxLength={90} required placeholder={t.titlePlaceholder} /></label>
      <label>{t.bodyLabel}<textarea name="body" minLength={20} maxLength={2000} required rows={5} placeholder={t.bodyPlaceholder} /></label>
      <div className="form-grid"><label>{t.category}<select name="category">{categories.map((category) => <option key={category} value={category}>{categoryLabels[category][language]}</option>)}</select></label><label>{t.city}<input name="city" placeholder="Toshkent" /></label></div>
      <label className="check-row"><input type="checkbox" name="anonymous" defaultChecked /><span><b>{t.anonymous}</b><small>{t.anonymousHelp}</small></span></label>
      <label className="check-row"><input type="checkbox" name="mosque" /><span><b>{t.mosqueConsent}</b><small>Faqat tasdiqlangan vakil ko‘radi.</small></span></label>
      <label className="check-row"><input type="checkbox" name="emergency" defaultChecked={emergencyOverride} /><span><b>{t.emergency}</b><small>{t.emergencyHelp}</small></span></label>
      <div className="form-actions"><button type="button" className="soft-button" onClick={onClose}>{t.cancel}</button><button type="submit" className="primary-button">{t.publish}<span>→</span></button></div>
    </form>}
  </section></div>;
}

function MosqueView() {
  return <div className="feature-view"><div className="feature-hero"><span>⌒</span><div><p className="eyebrow">XARITA VA HAMKORLAR</p><h2>Yaqiningizdagi masjidlar</h2><p>Xaritadan masjid va tahoratxonani toping. Duo so‘rovi esa faqat aniq roziligingiz bilan tasdiqlangan masjid vakiliga yuboriladi.</p></div></div><NearbyMap /><div className="partner-heading"><div><p className="eyebrow">DUODOSH HAMKORLARI</p><h2>Tasdiqlangan masjidlar</h2></div><p>Quyidagi masjidlar Duodosh bilan bog‘langan. Xaritadagi boshqa joylar OpenStreetMap ma’lumotidir.</p></div><div className="mosque-list">{[{ name: "Minor masjidi", city: "Toshkent", members: "12.4 ming" }, { name: "Imom Buxoriy majmuasi", city: "Samarqand", members: "8.7 ming" }].map((mosque) => <article key={mosque.name}><div className="mosque-thumb">☾</div><div><span className="verified">✓ Tasdiqlangan</span><h3>{mosque.name}</h3><p>{mosque.city} · {mosque.members} hamjamiyat a’zosi</p></div><button className="soft-button">Ko‘rish →</button></article>)}</div></div>;
}

function NotificationsView() {
  return <div className="feature-view"><h2>Bildirishnomalar</h2><div className="notification-list"><article><span className="round-icon">☾</span><div><b>12 inson sizning so‘rovingizni duoda esladi</b><p>“Imtihonim uchun duo qiling” · 18 daqiqa oldin</p></div></article><article><span className="round-icon coral-bg">♡</span><div><b>Saqlagan niyatingizga yangilanish qo‘shildi</b><p>“Onamning operatsiyasi...” · 1 soat oldin</p></div></article></div></div>;
}

function ProfileView({ viewerName, initial }: { viewerName: string; initial: string }) {
  return <div className="feature-view"><div className="profile-header"><span className="avatar coral large">{initial}</span><div><h2>{viewerName}</h2><p>Toshkent, O‘zbekiston · O‘zbekcha</p></div><button className="soft-button">Tahrirlash</button></div><div className="profile-stats"><article><b>18</b><span>duoda eslangan inson</span></article><article><b>4</b><span>saqlangan niyat</span></article><article><b>2</b><span>faol so‘rov</span></article></div><div className="settings-card"><h3>Maxfiylik va xavfsizlik</h3><button>Standart anonimlik <span>Yoqilgan ›</span></button><button>Joylashuv ko‘rinishi <span>Faqat shahar ›</span></button><button>Bloklangan foydalanuvchilar <span>0 ›</span></button><button className="danger">Hisobni o‘chirish <span>›</span></button></div></div>;
}
