import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SignJWT } from "jose";

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

    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) {
      return NextResponse.json(
        { success: false, error: "Server authentication secret is not configured." },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({ unlocked: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Set cookie: site_unlocked=JWT_TOKEN, httpOnly, secure, maxAge 7 days
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: "site_unlocked",
      value: token,
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

