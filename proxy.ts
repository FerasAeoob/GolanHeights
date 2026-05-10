import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'he', 'ar'];
const ADMIN_SEGMENT = 'area-51-sec';

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get('user_token')?.value;
    if (!token) return false;

    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) return false;

    try {
        const secret = new TextEncoder().encode(secretStr);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch (e) {
        return false;
    }
}

/**
 * Next.js 16 Proxy function.
 * Protects /[lang]/area-51-sec/* routes behind JWT admin role,
 * redirecting unauthenticated users to the main login page.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

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
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};