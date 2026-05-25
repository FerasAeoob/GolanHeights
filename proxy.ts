import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "he", "ar"] as const;
type Lang = typeof locales[number];
const ADMIN_SEGMENT = "area-51-sec";

let cachedSecretValue: string | null = null;
let cachedSecret: Uint8Array | null = null;

function getEncodedSecret(): Uint8Array | null {
    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) return null;

    if (!cachedSecret || cachedSecretValue !== secretStr) {
        cachedSecretValue = secretStr;
        cachedSecret = new TextEncoder().encode(secretStr);
    }

    return cachedSecret;
}

function isBypassPath(pathname: string) {
    return (
        pathname === "/lock" ||
        pathname === "/api/unlock" ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname === "/site.webmanifest" ||
        pathname.startsWith("/images/") ||
        pathname.startsWith("/icons/") ||
        pathname.startsWith("/fonts/") ||
        pathname === "/logox.png" ||
        /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf|pdf)$/i.test(pathname)
    );
}

async function checkIsUnlocked(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get("site_unlocked")?.value;
    if (!token) return false;

    const secret = getEncodedSecret();
    if (!secret) return false;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.unlocked === true;
    } catch {
        return false;
    }
}

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get("user_token")?.value;
    if (!token) return false;

    const secret = getEncodedSecret();
    if (!secret) return false;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.role === "admin";
    } catch {
        return false;
    }
}

function getBrowserLanguage(acceptLanguageHeader: string | null): Lang {
    if (!acceptLanguageHeader) return "en";

    const parts = acceptLanguageHeader.split(",");
    for (const part of parts) {
        const langPart = part.split(";")[0].trim().toLowerCase();
        const baseLang = langPart.split("-")[0];
        if (locales.includes(baseLang as Lang)) {
            return baseLang as Lang;
        }
    }

    return "en";
}

export async function proxy(request: NextRequest) {
    const isDebug = process.env.LOAD_TEST_DEBUG === "true";
    const tStart = isDebug ? performance.now() : 0;
    const { pathname } = request.nextUrl;

    let actionTaken = "skipped";
    let jwtVerified = "no";

    // 1. Bypass static/public resources
    if (isBypassPath(pathname)) {
        if (isDebug) {
            const tEnd = performance.now();
            console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=skipped (bypass path) | jwtVerified=no | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
        }
        return NextResponse.next();
    }

    // 2. Site Lock Access Control
    const accessCode = process.env.SITE_ACCESS_CODE;
    if (accessCode) {
        actionTaken = "checked";
        const token = request.cookies.get("site_unlocked")?.value;
        if (token) {
            jwtVerified = "yes";
        }

        const isUnlocked = await checkIsUnlocked(request);

        if (!isUnlocked) {
            if (isDebug) {
                const tEnd = performance.now();
                console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=checked (redirect to lock) | jwtVerified=${jwtVerified} | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
            }
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { success: false, error: "Unauthorized. Site is locked." },
                    { status: 401 }
                );
            }

            return NextResponse.redirect(new URL("/lock", request.url));
        }
    }

    // 3. API endpoints pass-through
    if (pathname.startsWith("/api/")) {
        if (isDebug) {
            const tEnd = performance.now();
            console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=${actionTaken} (api pass through) | jwtVerified=${jwtVerified} | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
        }
        return NextResponse.next();
    }

    // 4. Handle exact /en prefix cleanup
    if (pathname === '/en' || pathname.startsWith('/en/')) {
        const newPath = pathname.replace(/^\/en/, '') || '/';
        const redirectUrl = new URL(newPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
    }

    // 5. Root-only preferred language detection
    if (pathname === '/') {
        let detectedLang: Lang = "en";
        const cookieLang = request.cookies.get("preferred_language")?.value;

        if (cookieLang && locales.includes(cookieLang as Lang)) {
            detectedLang = cookieLang as Lang;
        } else {
            const acceptLang = request.headers.get("accept-language");
            detectedLang = getBrowserLanguage(acceptLang);
        }

        if (detectedLang === "he" || detectedLang === "ar") {
            const redirectUrl = new URL(`/${detectedLang}`, request.url);
            redirectUrl.search = request.nextUrl.search;
            if (isDebug) {
                const tEnd = performance.now();
                console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=redirect (root preferred: ${detectedLang}) | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
            }
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 6. Admin Authorization Route check
    const isHebrewOrArabic = pathname === '/he' || pathname.startsWith('/he/') || pathname === '/ar' || pathname.startsWith('/ar/');
    const segments = pathname.split('/').filter(Boolean);
    
    // If it's he/ar, the first segment is the locale. Otherwise, it's English, so the first segment is the actual route.
    const routeSegments = isHebrewOrArabic ? segments.slice(1) : segments;
    const isAdminRoute = routeSegments[0] === ADMIN_SEGMENT;

    if (isAdminRoute) {
        const isAdmin = await checkIsAdmin(request);

        if (!isAdmin) {
            if (isDebug) {
                const tEnd = performance.now();
                console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=checked (unauthorized admin access) | jwtVerified=${jwtVerified} | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
            }
            const prefix = isHebrewOrArabic ? `/${segments[0]}` : '';
            const loginUrl = new URL(`${prefix}/login`, request.url);
            loginUrl.search = request.nextUrl.search;
            return NextResponse.redirect(loginUrl);
        }
    }

    // 7. Pass through /he and /ar, rewrite everything else to /en/...
    if (isHebrewOrArabic) {
        if (isDebug) {
            const tEnd = performance.now();
            console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=pass-through (he/ar) | jwtVerified=${jwtVerified} | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
        }
        return NextResponse.next();
    }

    if (isDebug) {
        const tEnd = performance.now();
        console.log(`[DEBUG] middleware/proxy: path=${pathname} | action=rewrite (to /en) | jwtVerified=${jwtVerified} | elapsed=${(tEnd - tStart).toFixed(2)}ms`);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf|pdf)$).*)",
    ],
};
