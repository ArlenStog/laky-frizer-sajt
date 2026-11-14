import { NextResponse } from "next/server";
import { addBlock, BookingError, isAdmin } from "@/lib/bookings";

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  try {
    const body = await req.json();
    const block = await addBlock({
      date: String(body.date ?? ""),
      start: body.start || undefined,
      end: body.end || undefined,
      reason: body.reason || undefined,
    });
    return NextResponse.json({ ok: true, block }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }
}
