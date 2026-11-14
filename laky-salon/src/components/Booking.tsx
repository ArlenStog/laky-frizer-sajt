"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { services, BOOKING_WINDOW_DAYS } from "@/lib/salon";

type DayInfo = { status: "closed" | "full" | "few" | "free"; free: number; total: number };
type Slot = { time: string; start: number; available: boolean };

const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
const DOW = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number) => `${y}-${pad(m + 1)}`;
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const formatDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const dow = ["nedelja", "ponedeljak", "utorak", "sreda", "četvrtak", "petak", "subota"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${dow}, ${d}. ${MONTHS[m - 1]} ${y}.`;
};

export default function Booking() {
  const now = new Date();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ date: string; time: string } | null>(null);

  const service = services.find((s) => s.id === serviceId)!;

  // Izbor usluge sa kartica u sekciji "Usluge"
  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((s) => s.id === id)) setServiceId(id);
    };
    window.addEventListener("select-service", onSelect);
    return () => window.removeEventListener("select-service", onSelect);
  }, []);

  const loadMonth = useCallback(async () => {
    setLoadingMonth(true);
    try {
      const res = await fetch(`/api/availability?month=${toKey(view.y, view.m)}&service=${serviceId}`, { cache: "no-store" });
      const data = await res.json();
      setDays(data.days ?? {});
    } finally {
      setLoadingMonth(false);
    }
  }, [view, serviceId]);

  const loadSlots = useCallback(async (d: string) => {
    setSlots(null);
    const res = await fetch(`/api/availability?date=${d}&service=${serviceId}`, { cache: "no-store" });
    const data = await res.json();
    setSlots(data.slots ?? []);
  }, [serviceId]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  // Kad se promeni usluga, osveži termine za izabrani dan
  useEffect(() => {
    setTime(null);
    if (date) loadSlots(date);
  }, [serviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const grid = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // ponedeljak prvi
    const count = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= count; d++) cells.push(`${toKey(view.y, view.m)}-${pad(d)}`);
    return cells;
  }, [view]);

  const maxMonth = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + BOOKING_WINDOW_DAYS);
    return { y: d.getFullYear(), m: d.getMonth() };
  }, []);
  const canPrev = view.y > now.getFullYear() || (view.y === now.getFullYear() && view.m > now.getMonth());
  const canNext = view.y < maxMonth.y || (view.y === maxMonth.y && view.m < maxMonth.m);
  const shift = (n: number) => setView((v) => {
    const d = new Date(v.y, v.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const pickDate = (d: string) => {
    setDate(d);
    setTime(null);
    setError(null);
    loadSlots(d);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, serviceId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Došlo je do greške.");
        if (res.status === 409) {
          setTime(null);
          loadSlots(date);
          loadMonth();
        }
        return;
      }
      setDone({ date, time });
      loadMonth();
    } catch {
      setError("Nema veze sa serverom. Pokušajte ponovo.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setDone(null);
    setDate(null);
    setSlots(null);
    setTime(null);
    setForm({ name: "", phone: "", note: "" });
  };

  if (done) {
    return (
      <div className="panel success" role="status">
        <span className="eyebrow">Termin je zakazan</span>
        <h3>Vidimo se!</h3>
        <p className="muted">
          {service.name} · {formatDate(done.date)} u {done.time}
        </p>
        <p className="muted" style={{ marginTop: 8 }}>Ako ne možete da dođete, javite nam se na vreme.</p>
        <button className="btn" style={{ marginTop: 28 }} onClick={reset}>
          Zakaži još jedan termin
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="step">
        <div className="step__title"><small>01</small> Usluga</div>
        <div className="chips">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${s.id === serviceId ? "chip--on" : ""}`}
              onClick={() => setServiceId(s.id)}
              aria-pressed={s.id === serviceId}
            >
              {s.name}
              <small>{s.duration} min</small>
            </button>
          ))}
        </div>
      </div>

      <div className="step">
        <div className="step__title"><small>02</small> Datum</div>
        <div className="cal" aria-busy={loadingMonth}>
          <div className="cal__head">
            <strong>{MONTHS[view.m]} {view.y}.</strong>
            <div className="cal__nav">
              <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Prethodni mesec">‹</button>
              <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Sledeći mesec">›</button>
            </div>
          </div>
          <div className="cal__grid">
            {DOW.map((d) => <div key={d} className="cal__dow">{d}</div>)}
            {grid.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const info = days[d];
              const status = info?.status ?? "closed";
              const disabled = status === "closed" || status === "full";
              const title = status === "closed" ? "Zatvoreno" : status === "full" ? "Sve je zauzeto" : `Slobodnih termina: ${info.free}`;
              return (
                <button
                  key={d}
                  type="button"
                  className={`day day--${status} ${d === date ? "day--sel" : ""} ${d === todayStr() ? "day--today" : ""}`}
                  disabled={disabled}
                  title={title}
                  aria-label={`${formatDate(d)} – ${title}`}
                  onClick={() => pickDate(d)}
                >
                  {Number(d.slice(-2))}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <span><i style={{ background: "var(--free)" }} />Slobodno</span>
            <span><i style={{ background: "var(--few)" }} />Malo termina</span>
            <span><i style={{ background: "var(--full)" }} />Popunjeno</span>
          </div>
        </div>
      </div>

      <div className="step">
        <div className="step__title"><small>03</small> Vreme</div>
        {!date && <p className="muted">Izaberite datum u kalendaru.</p>}
        {date && !slots && <p className="muted">Učitavanje termina…</p>}
        {date && slots && slots.length === 0 && <p className="muted">Za ovaj dan nema termina.</p>}
        {date && slots && slots.length > 0 && (
          <div className="slots">
            {slots.map((s) => (
              <button
                key={s.time}
                type="button"
                className={`slot ${s.time === time ? "slot--on" : ""}`}
                disabled={!s.available}
                onClick={() => setTime(s.time)}
                aria-label={`${s.time}${s.available ? "" : " – zauzeto"}`}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className="step" onSubmit={submit}>
        <div className="step__title"><small>04</small> Vaši podaci</div>
        {error && <div className="alert alert--err" role="alert">{error}</div>}
        <div className="form">
          <div className="field">
            <label htmlFor="b-name">Ime i prezime</label>
            <input id="b-name" required minLength={2} maxLength={80} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="b-phone">Telefon</label>
            <input id="b-phone" required type="tel" placeholder="06x xxx xxxx" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
          </div>
          <div className="field field--full">
            <label htmlFor="b-note">Napomena (opciono)</label>
            <textarea id="b-note" rows={3} maxLength={500} value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>
        <div className="summary">
          <span><strong>{service.name}</strong> · {service.price}</span>
          <span>{date && time ? `${formatDate(date)} u ${time}` : "Izaberite datum i vreme"}</span>
        </div>
        <button className="btn" type="submit" disabled={!date || !time || sending}>
          {sending ? "Šaljem…" : "Potvrdi termin"}
        </button>
      </form>
    </div>
  );
}
