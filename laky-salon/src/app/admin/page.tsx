"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/salon";

type Booking = { id: string; date: string; start: number; end: number; serviceId: string; name: string; phone: string; note?: string };
type Block = { id: string; date: string; start?: number; end?: number; reason?: string };

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? id;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<{ bookings: Booking[]; blocks: Block[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [block, setBlock] = useState({ date: today(), start: "", end: "", reason: "" });

  const api = useCallback(
    (url: string, init?: RequestInit) =>
      fetch(url, { ...init, headers: { "Content-Type": "application/json", "x-admin-password": password, ...init?.headers } }),
    [password],
  );

  const load = useCallback(async () => {
    const res = await api("/api/admin/bookings");
    if (res.status === 401) {
      setAuthed(false);
      setError("Pogrešna lozinka.");
      try { sessionStorage.removeItem("laky-admin"); } catch {}
      return;
    }
    setData(await res.json());
    setAuthed(true);
    setError(null);
    try { sessionStorage.setItem("laky-admin", password); } catch {}
  }, [api, password]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("laky-admin");
      if (saved) setPassword(saved);
    } catch {}
  }, []);

  const cancel = async (id: string) => {
    if (!confirm("Otkazati ovu rezervaciju? Termin će ponovo biti slobodan.")) return;
    await api(`/api/admin/bookings/${id}`, { method: "DELETE" });
    load();
  };

  const removeBlock = async (id: string) => {
    await api(`/api/admin/blocks/${id}`, { method: "DELETE" });
    load();
  };

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api("/api/admin/blocks", { method: "POST", body: JSON.stringify(block) });
    const json = await res.json();
    if (!res.ok) return setError(json.error);
    setBlock({ ...block, start: "", end: "", reason: "" });
    load();
  };

  const grouped = useMemo(() => {
    const t = today();
    const list = (data?.bookings ?? []).filter((b) => showPast || b.date >= t);
    const map = new Map<string, Booking[]>();
    for (const b of list) map.set(b.date, [...(map.get(b.date) ?? []), b]);
    return [...map.entries()];
  }, [data, showPast]);

  if (!authed) {
    return (
      <main className="container admin" style={{ maxWidth: 460 }}>
        <h1>Admin</h1>
        <p className="muted">Pregled zakazanih termina i blokiranje kalendara.</p>
        <form className="panel" style={{ marginTop: 24 }} onSubmit={(e) => { e.preventDefault(); load(); }}>
          {error && <div className="alert alert--err">{error}</div>}
          <div className="field">
            <label htmlFor="pw">Lozinka</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </div>
          <button className="btn" style={{ marginTop: 16 }}>Prijava</button>
        </form>
      </main>
    );
  }

  return (
    <main className="container admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1>Kalendar termina</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost" onClick={load}>Osveži</button>
          <Link className="btn" href="/">Sajt</Link>
        </div>
      </div>
      {error && <div className="alert alert--err" style={{ marginTop: 16 }}>{error}</div>}

      <div className="admin__grid">
        <div className="panel">
          <div className="step__title">Blokiraj termin</div>
          <p className="muted" style={{ marginBottom: 14 }}>Za odmor, praznik ili pauzu. Bez vremena = ceo dan.</p>
          <form onSubmit={addBlock} style={{ display: "grid", gap: 12 }}>
            <div className="field">
              <label htmlFor="bl-date">Datum</label>
              <input id="bl-date" type="date" required value={block.date} onChange={(e) => setBlock({ ...block, date: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label htmlFor="bl-s">Od</label>
                <input id="bl-s" type="time" step={1800} value={block.start} onChange={(e) => setBlock({ ...block, start: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="bl-e">Do</label>
                <input id="bl-e" type="time" step={1800} value={block.end} onChange={(e) => setBlock({ ...block, end: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="bl-r">Razlog</label>
              <input id="bl-r" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} placeholder="npr. Godišnji odmor" />
            </div>
            <button className="btn">Blokiraj</button>
          </form>

          <div className="step__title" style={{ marginTop: 30 }}>Blokade</div>
          {data?.blocks.length ? (
            <table className="table">
              <tbody>
                {data.blocks.map((b) => (
                  <tr key={b.id}>
                    <td>{b.date}</td>
                    <td>{b.start !== undefined && b.end !== undefined ? `${fmt(b.start)}–${fmt(b.end)}` : "ceo dan"}</td>
                    <td>{b.reason}</td>
                    <td><button className="btn-sm" onClick={() => removeBlock(b.id)}>Ukloni</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">Nema blokada.</p>}
        </div>

        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="step__title" style={{ margin: 0 }}>Rezervacije ({data?.bookings.length ?? 0})</div>
            <label className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> prikaži prošle
            </label>
          </div>
          {grouped.length === 0 && <p className="muted">Nema zakazanih termina.</p>}
          {grouped.map(([date, list]) => (
            <div key={date} style={{ marginTop: 18 }}>
              <span className="tag">{date}</span>
              <table className="table" style={{ marginTop: 6 }}>
                <thead><tr><th>Vreme</th><th>Klijent</th><th>Usluga</th><th>Napomena</th><th /></tr></thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{fmt(b.start)}</strong>–{fmt(b.end)}</td>
                      <td>{b.name}<br /><a className="muted" href={`tel:${b.phone}`}>{b.phone}</a></td>
                      <td>{serviceName(b.serviceId)}</td>
                      <td className="muted">{b.note}</td>
                      <td><button className="btn-sm" onClick={() => cancel(b.id)}>Otkaži</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
