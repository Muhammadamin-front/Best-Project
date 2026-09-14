"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Referral = { id: string; status: string; createdAt: string; requestId: string; title: string; body: string; category: string; isEmergency: boolean };

export default function MosqueDashboard({ viewerName, mosqueId }: { viewerName: string; mosqueId: string }) {
  const [items, setItems] = useState<Referral[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  async function load() {
    const response = await fetch(`/api/mosques/${mosqueId}/referrals`);
    if (response.status === 403) return setState("forbidden");
    if (!response.ok) return setState("error");
    const payload = await response.json() as { referrals: Referral[] };
    setItems(payload.referrals); setState("ready");
  }
  useEffect(() => {
    let active = true;
    void fetch(`/api/mosques/${mosqueId}/referrals`).then(async (response) => {
      if (!active) return;
      if (response.status === 403) return setState("forbidden");
      if (!response.ok) return setState("error");
      const payload = await response.json() as { referrals: Referral[] };
      if (active) { setItems(payload.referrals); setState("ready"); }
    }).catch(() => active && setState("error"));
    return () => { active = false; };
  }, [mosqueId]);
  async function act(referralId: string, action: "accept" | "decline" | "included_in_prayer") {
    const response = await fetch(`/api/mosques/${mosqueId}/referrals`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ referralId, action }) });
    if (response.ok) await load();
  }
  return <main className="ops-shell mosque-ops"><header className="ops-header"><Link href="/" className="brand"><span className="brand-mark small"><span>☾</span><i>•</i></span><span>duodosh</span></Link><div><span>Masjid vakili</span><b>{viewerName}</b></div></header><section className="ops-content"><div className="ops-title"><p className="eyebrow">MINOR MASJIDI</p><h1>Jamoaviy duo navbati</h1><p>Bu yerda faqat foydalanuvchi rozilik bergan so‘rovlar ko‘rinadi.</p></div>
    {state === "loading" && <div className="ops-state">So‘rovlar yuklanmoqda…</div>}{state === "forbidden" && <div className="ops-state"><b>Vakillik tasdig‘i kerak</b><p>Administrator sizni tasdiqlangan masjid vakili sifatida biriktirishi kerak.</p><Link href="/">Duo oqimiga qaytish</Link></div>}{state === "error" && <div className="ops-state">Kabinetni yuklab bo‘lmadi.</div>}{state === "ready" && <div className="referral-list">{items.length === 0 ? <div className="ops-empty">Yangi referral yo‘q.</div> : items.map((item) => <article className="ops-card" key={item.id}>{item.isEmergency && <span className="urgent">USTUVOR</span>}<small>{item.category} · {item.status}</small><h3>{item.title}</h3><p>{item.body}</p><div><button className="approve" onClick={() => act(item.id, "accept")}>Qabul qilish</button><button onClick={() => act(item.id, "included_in_prayer")}>Jamoatda duo qilindi</button><button className="reject" onClick={() => act(item.id, "decline")}>Rad etish</button></div></article>)}</div>}
  </section></main>;
}
