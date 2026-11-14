import { NextResponse } from "next/server";
import { BookingError, createBooking, fmtTime } from "@/lib/bookings";

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }
  try {
    const b = await createBooking({
      date: String(body.date ?? ""),
      time: String(body.time ?? ""),
      serviceId: String(body.serviceId ?? ""),
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json(
      { ok: true, booking: { id: b.id, date: b.date, time: fmtTime(b.start), serviceId: b.serviceId } },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Greška na serveru." }, { status: 500 });
  }
}
