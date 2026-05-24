import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const unlockLimiter = { name: "unlock", maxRequests: 5, windowSeconds: 15 * 60 };

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(unlockLimiter, ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const { code } = await request.json();

    const expectedCode = process.env.SITE_ACCESS_CODE;

    if (!expectedCode) {
      return NextResponse.json(
        { success: false, error: "Access code is not configured on the server." },
        { status: 500 }
      );
    }

    if (code !== expectedCode) {
      return NextResponse.json(
        { success: false, error: "Incorrect access code." },
        { status: 401 }
      );
    }

    // Set cookie: site_unlocked=true, httpOnly, secure, maxAge 7 days
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: "site_unlocked",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request data." },
      { status: 400 }
    );
  }
}
