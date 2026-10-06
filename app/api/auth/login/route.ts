import { NextResponse } from "next/server";
import { loginWithIdentifier } from "@/lib/auth/login";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await loginWithIdentifier({
      identifier: String(body.identifier ?? body.nik ?? ""),
      password: body.password,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "NIK/email atau password salah.",
      },
      {
        status: 400,
      },
    );
  }
}
