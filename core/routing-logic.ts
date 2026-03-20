import { NextRequest, NextResponse } from 'next/server';

export function handleRequest(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip Static Assets (Crucial for your Logo!)
    // If the URL has a dot (like .png) or starts with _next, ignore it.
    if (pathname.includes('.') || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    // 2. Handle the "English Hidden" Rule
    // If user goes to /en/places -> redirect to /places
    if (pathname.startsWith('/en')) {
        const newPath = pathname.replace('/en', '') || '/';
        return NextResponse.redirect(new URL(newPath, request.url));
    }

    // 3. Handle Arabic and Hebrew (Let them pass)
    if (pathname.startsWith('/ar') || pathname.startsWith('/he')) {
        return NextResponse.next();
    }

    // 4. Handle the "Clean" English Route
    // If user goes to /places -> internally rewrite to /en/places
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
}