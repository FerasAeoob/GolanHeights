import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'he', 'ar'];
const ADMIN_SEGMENT = 'area-51-sec';

let cachedSecret: Uint8Array | null = null;
function getEncodedSecret(): Uint8Array | null {
    if (cachedSecret) return cachedSecret;
    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) return null;
    cachedSecret = new TextEncoder().encode(secretStr);
    return cachedSecret;
}

async function checkIsUnlocked(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get('site_unlocked')?.value;
    if (!token) return false;

    const secret = getEncodedSecret();
    if (!secret) return false;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.unlocked === true;
    } catch (e) {
        return false;
    }
}

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get('user_token')?.value;
    if (!token) return false;

    const secret = getEncodedSecret();
    if (!secret) return false;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch (e) {
        return false;
    }
}

/**
 * Next.js 16 Proxy function (acting as the edge middleware).
 * Protects the site behind a password lock if SITE_ACCESS_CODE is configured.
 * Also handles locale rewrites and admin segment route protection.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // ============================================================ UNDER IS LOCK
    // Check if site access code is configured
    const accessCode = process.env.SITE_ACCESS_CODE;

    if (accessCode) {
        // 1. Bypass lock check immediately for public/system paths to avoid parsing site_unlocked cookie/JWT on every asset
        if (
            pathname === '/lock' ||
            pathname === '/api/unlock' ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon.ico') ||
            pathname.startsWith('/logox.png') ||
            pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp)$/)
        ) {
            return NextResponse.next();
        }

        // 2. Perform lock check for protected paths
        const isUnlocked = await checkIsUnlocked(request);
        if (!isUnlocked) {
            // Return 401 for API requests when locked
            if (pathname.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({ success: false, error: 'Unauthorized. Site is locked.' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Redirect all other pages to /lock
            const lockUrl = new URL('/lock', request.url);
            return NextResponse.redirect(lockUrl);
        }
    }

    // Bypass original locale rewrite and admin routing logic for api calls and the lock page
    if (pathname.startsWith('/api/') || pathname === '/lock') {
        return NextResponse.next();
    }

    // ============================================================ ABOVE IS LOCK


    // 1. Remove explicit '/en' from the URL (SEO & default behavior)
    // If a user visits /en/places, redirect them to /places
    if (pathname.startsWith('/en')) {
        const newPathname = pathname.replace(/^\/en/, '') || '/';
        const redirectUrl = new URL(newPathname, request.url);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
    }

    const segments = pathname.split('/').filter(Boolean);
    const hasLocale = locales.includes(segments[0]);

    // Get the path segments after the locale (or from the start if no locale)
    const routeSegments = hasLocale ? segments.slice(1) : segments;

    // 2. Admin Security Check (Must happen BEFORE the rewrite)
    const isAdminRoute = routeSegments[0] === ADMIN_SEGMENT;

    if (isAdminRoute) {
        const isAdmin = await checkIsAdmin(request);

        // Block unauthenticated access to admin routes
        if (!isAdmin) {
            // Redirect to main login page, preserving any non-English locale
            const prefix = hasLocale ? `/${segments[0]}` : '';
            const loginUrl = new URL(`${prefix}/login`, request.url);
            loginUrl.search = request.nextUrl.search;
            return NextResponse.redirect(loginUrl);
        }
    }

    // 3. Locale Rewrite for bare paths
    // If the path doesn't start with a locale (like /places), it means it's the default English.
    // We rewrite it internally to /en/places so Next.js finds the right page folder.
    if (!hasLocale) {
        const rewriteUrl = new URL(`/en${pathname === '/' ? '' : pathname}`, request.url);
        rewriteUrl.search = request.nextUrl.search;
        return NextResponse.rewrite(rewriteUrl);
    }

    // Pass through for explicit locales like /he or /ar
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf|pdf)$).*)",
    ],
};
