import { NextResponse } from "next/server";
import { getDaySlots, getMonthOverview, isValidDate } from "@/lib/bookings";

export const dynamic = "force-dynamic";

// GET /api/availability?month=2026-11&service=...  -> status svakog dana
// GET /api/availability?date=2026-11-20&service=... -> termini za dan
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service") ?? undefined;
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  if (date) {
    if (!isValidDate(date)) return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });
    return NextResponse.json({ date, slots: await getDaySlots(date, service) });
  }
  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ month, days: await getMonthOverview(month, service) });
  }
  return NextResponse.json({ error: "Prosledite ?date= ili ?month=." }, { status: 400 });
}
