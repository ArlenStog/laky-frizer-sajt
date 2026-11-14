import { NextResponse } from "next/server";
import { BookingError, deleteBooking, isAdmin } from "@/lib/bookings";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  try {
    await deleteBooking((await params).id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
