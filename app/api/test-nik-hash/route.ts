import { NextResponse } from "next/server";

// Retained as a 404 to avoid stale generated route references. NIK hashing is
// intentionally unavailable through a public endpoint.
export async function POST() {
  return NextResponse.json({ success: false }, { status: 404 });
}
