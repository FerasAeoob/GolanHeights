import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'he', 'ar'];
const ADMIN_SEGMENT = 'area-51-sec';
const LOGIN_SEGMENT = 'login';

/**
 * Next.js 16 Proxy function.
 * Protects /[lang]/area-51-sec/* routes behind an admin cookie,
 * while always allowing access to the login page.
 */
export function proxy(request: NextRequest) {
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
        const isLoginPage = routeSegments[1] === LOGIN_SEGMENT;
        const isAdmin = request.cookies.get('admin_session')?.value === 'true';

        // Block unauthenticated access to non-login admin routes
        if (!isLoginPage && !isAdmin) {
            // Redirect to login page, preserving any non-English locale (like /he)
            const prefix = hasLocale ? `/${segments[0]}` : '';
            const loginUrl = new URL(`${prefix}/${ADMIN_SEGMENT}/${LOGIN_SEGMENT}`, request.url);
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
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};