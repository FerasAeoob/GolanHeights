// proxy.ts (at the ROOT)
import { NextRequest } from 'next/server';
import { handleRequest } from './core/routing-logic';

export const config = {
    // This matcher ensures the proxy doesn't slow down your API or static files
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function proxy(request: NextRequest) {
    return handleRequest(request);
}