"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FlaggedRequest = { id: string; title: string; body: string; category: string; isEmergency: boolean; createdAt: string };
type OpenReport = { id: string; targetType: string; targetId: string; reason: string; details?: string | null; priority: string; createdAt: string };

export default function ModerationDashboard({ viewerName }: { viewerName: string }) {
  const [requests, setRequests] = useState<FlaggedRequest[]>([]);
  const [reports, setReports] = useState<OpenReport[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");

  async function load() {
    const response = await fetch("/api/moderation/queue");
    if (response.status === 403) return setState("forbidden");
    if (!response.ok) return setState("error");
    const payload = await response.json() as { flaggedRequests: FlaggedRequest[]; openReports: OpenReport[] };
    setRequests(payload.flaggedRequests); setReports(payload.openReports); setState("ready");
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/moderation/queue").then(async (response) => {
      if (!active) return;
      if (response.status === 403) return setState("forbidden");
      if (!response.ok) return setState("error");
      const payload = await response.json() as { flaggedRequests: FlaggedRequest[]; openReports: OpenReport[] };
      if (active) { setRequests(payload.flaggedRequests); setReports(payload.openReports); setState("ready"); }
    }).catch(() => active && setState("error"));
    return () => { active = false; };
  }, []);

  async function review(targetType: "prayer_request" | "report", targetId: string, action: "publish" | "reject" | "resolve_report") {
    const response = await fetch("/api/moderation/queue", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetType, targetId, action, note: "Dashboard review" }) });
    if (response.ok) await load();
  }

  return <main className="ops-shell">
    <header className="ops-header"><Link href="/" className="brand"><span className="brand-mark small"><span>☾</span><i>•</i></span><span>duodosh</span></Link><div><span>Moderator</span><b>{viewerName}</b></div></header>
    <section className="ops-content"><div className="ops-title"><p className="eyebrow">XAVFSIZLIK MARKAZI</p><h1>Moderatsiya navbati</h1><p>Shoshilinch so‘rovlar birinchi ko‘rsatiladi. Har bir qaror audit jurnalida saqlanadi.</p></div>
      {state === "loading" && <div className="ops-state">Navbat yuklanmoqda…</div>}
      {state === "forbidden" && <div className="ops-state"><b>Ruxsat yetarli emas</b><p>Bu bo‘lim faqat moderator va administratorlarga ochiq.</p><Link href="/">Duo oqimiga qaytish</Link></div>}
      {state === "error" && <div className="ops-state"><b>Navbatni yuklab bo‘lmadi</b><p>Birozdan keyin qayta urinib ko‘ring.</p></div>}
      {state === "ready" && <div className="ops-columns"><section><div className="ops-section-title"><h2>Tekshiruvdagi so‘rovlar</h2><span>{requests.length}</span></div>{requests.length === 0 ? <div className="ops-empty">Hozir navbat bo‘sh.</div> : requests.map((item) => <article className="ops-card" key={item.id}>{item.isEmergency && <span className="urgent">SHOSHILINCH</span>}<small>{item.category} · {item.createdAt}</small><h3>{item.title}</h3><p>{item.body}</p><div><button className="approve" onClick={() => review("prayer_request", item.id, "publish")}>✓ Nashr qilish</button><button className="reject" onClick={() => review("prayer_request", item.id, "reject")}>× Rad etish</button></div></article>)}</section>
      <section><div className="ops-section-title"><h2>Ochiq shikoyatlar</h2><span>{reports.length}</span></div>{reports.length === 0 ? <div className="ops-empty">Ochiq shikoyat yo‘q.</div> : reports.map((item) => <article className="ops-card compact" key={item.id}><span className={item.priority === "urgent" ? "urgent" : "category"}>{item.priority}</span><small>{item.targetType} · {item.reason}</small><h3>{item.details || "Qo‘shimcha izoh berilmagan"}</h3><button className="approve" onClick={() => review("report", item.id, "resolve_report")}>Yakunlash</button></article>)}</section></div>}
    </section>
  </main>;
}
