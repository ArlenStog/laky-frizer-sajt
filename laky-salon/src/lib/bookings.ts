import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { services, workingHours, SLOT_STEP, BOOKING_WINDOW_DAYS } from "./salon";

// ---- Tipovi ----
export type Booking = {
  id: string;
  date: string; // YYYY-MM-DD
  start: number; // minuti od ponoći
  end: number;
  serviceId: string;
  name: string;
  phone: string;
  note?: string;
  createdAt: string;
};

// Blokada: ceo dan (start/end izostavljeni) ili deo dana
export type Block = {
  id: string;
  date: string;
  start?: number;
  end?: number;
  reason?: string;
};

type DB = { bookings: Booking[]; blocks: Block[] };

// ---- Skladište (JSON fajl) ----
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DB>;
    return { bookings: parsed.bookings ?? [], blocks: parsed.blocks ?? [] };
  } catch {
    return { bookings: [], blocks: [] };
  }
}

async function writeDB(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

// Jednostavan red čekanja da dva zahteva ne bi istovremeno upisivala fajl
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

// ---- Pomoćne funkcije za datum (vreme u Beogradu) ----
const TZ = "Europe/Belgrade";

export function nowInBelgrade() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const hour = Number(get("hour")) % 24;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: hour * 60 + Number(get("minute")) };
}

export const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + "T00:00:00Z"));

export function dayOfWeek(date: string) {
  return new Date(date + "T00:00:00Z").getUTCDay();
}

function addDays(date: string, n: number) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export const fmtTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const overlaps = (a1: number, a2: number, b1: number, b2: number) => a1 < b2 && b1 < a2;

// ---- Izračunavanje slobodnih termina ----
export type Slot = { time: string; start: number; available: boolean };

function computeSlots(db: DB, date: string, duration: number): Slot[] {
  const hours = workingHours[dayOfWeek(date)];
  if (!hours) return [];
  const now = nowInBelgrade();
  const lastDate = addDays(now.date, BOOKING_WINDOW_DAYS);
  if (date < now.date || date > lastDate) return [];

  const busy: Array<[number, number]> = [];
  for (const b of db.bookings) if (b.date === date) busy.push([b.start, b.end]);
  for (const bl of db.blocks) {
    if (bl.date !== date) continue;
    if (bl.start === undefined || bl.end === undefined) return []; // ceo dan blokiran
    busy.push([bl.start, bl.end]);
  }

  const slots: Slot[] = [];
  for (let t = hours.open; t + duration <= hours.close; t += SLOT_STEP) {
    const past = date === now.date && t <= now.minutes + 30; // bar 30 min unapred
    const taken = busy.some(([s, e]) => overlaps(t, t + duration, s, e));
    slots.push({ time: fmtTime(t), start: t, available: !past && !taken });
  }
  return slots;
}

export async function getDaySlots(date: string, serviceId?: string) {
  const db = await readDB();
  const duration = services.find((s) => s.id === serviceId)?.duration ?? SLOT_STEP;
  return computeSlots(db, date, duration);
}

export type DayStatus = "closed" | "full" | "few" | "free";

// Status svakog dana u mesecu – za prikaz kalendara
export async function getMonthOverview(month: string, serviceId?: string) {
  const db = await readDB();
  const duration = services.find((s) => s.id === serviceId)?.duration ?? SLOT_STEP;
  const result: Record<string, { status: DayStatus; free: number; total: number }> = {};
  const n = daysInMonth(month);
  for (let d = 1; d <= n; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const slots = computeSlots(db, date, duration);
    const free = slots.filter((s) => s.available).length;
    const status: DayStatus = slots.length === 0 ? "closed" : free === 0 ? "full" : free <= 3 ? "few" : "free";
    result[date] = { status, free, total: slots.length };
  }
  return result;
}

// ---- Kreiranje rezervacije ----
export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function createBooking(input: {
  date: string;
  time: string;
  serviceId: string;
  name: string;
  phone: string;
  note?: string;
}) {
  const service = services.find((s) => s.id === input.serviceId);
  if (!service) throw new BookingError("Izaberite uslugu.");
  if (!isValidDate(input.date)) throw new BookingError("Neispravan datum.");
  if (!/^\d{2}:\d{2}$/.test(input.time)) throw new BookingError("Neispravno vreme.");
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  if (name.length < 2 || name.length > 80) throw new BookingError("Unesite ime i prezime.");
  if (!/^[+\d][\d\s/-]{5,19}$/.test(phone)) throw new BookingError("Unesite ispravan broj telefona.");
  const note = input.note?.trim().slice(0, 500) || undefined;

  const [h, m] = input.time.split(":").map(Number);
  const start = h * 60 + m;

  return withLock(async () => {
    const db = await readDB();
    const slot = computeSlots(db, input.date, service.duration).find((s) => s.start === start);
    if (!slot || !slot.available) throw new BookingError("Ovaj termin je upravo zauzet. Izaberite drugi.", 409);
    const booking: Booking = {
      id: crypto.randomUUID(),
      date: input.date,
      start,
      end: start + service.duration,
      serviceId: service.id,
      name,
      phone,
      note,
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    await writeDB(db);
    return booking;
  });
}

// ---- Administracija ----
export async function listAll() {
  const db = await readDB();
  const sort = <T extends { date: string; start?: number }>(a: T, b: T) =>
    a.date.localeCompare(b.date) || (a.start ?? 0) - (b.start ?? 0);
  return { bookings: [...db.bookings].sort(sort), blocks: [...db.blocks].sort(sort) };
}

export async function deleteBooking(id: string) {
  return withLock(async () => {
    const db = await readDB();
    const before = db.bookings.length;
    db.bookings = db.bookings.filter((b) => b.id !== id);
    if (db.bookings.length === before) throw new BookingError("Rezervacija nije pronađena.", 404);
    await writeDB(db);
  });
}

export async function addBlock(input: { date: string; start?: string; end?: string; reason?: string }) {
  if (!isValidDate(input.date)) throw new BookingError("Neispravan datum.");
  const toMin = (t?: string) => {
    if (!t) return undefined;
    if (!/^\d{2}:\d{2}$/.test(t)) throw new BookingError("Neispravno vreme.");
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const start = toMin(input.start);
  const end = toMin(input.end);
  if ((start === undefined) !== (end === undefined)) throw new BookingError("Unesite i početak i kraj, ili ništa za ceo dan.");
  if (start !== undefined && end !== undefined && end <= start) throw new BookingError("Kraj mora biti posle početka.");
  return withLock(async () => {
    const db = await readDB();
    const block: Block = { id: crypto.randomUUID(), date: input.date, start, end, reason: input.reason?.trim().slice(0, 120) || undefined };
    db.blocks.push(block);
    await writeDB(db);
    return block;
  });
}

export async function deleteBlock(id: string) {
  return withLock(async () => {
    const db = await readDB();
    db.blocks = db.blocks.filter((b) => b.id !== id);
    await writeDB(db);
  });
}

// ---- Provera admin lozinke ----
export function isAdmin(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = req.headers.get("x-admin-password") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
