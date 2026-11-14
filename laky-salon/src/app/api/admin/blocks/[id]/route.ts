import { NextResponse } from "next/server";
import { deleteBlock, isAdmin } from "@/lib/bookings";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  await deleteBlock((await params).id);
  return NextResponse.json({ ok: true });
}
