import { NextResponse } from "next/server";
import { isAdmin, listAll } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  return NextResponse.json(await listAll());
}
