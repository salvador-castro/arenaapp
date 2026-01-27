import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const url = request.nextUrl.clone()

    if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.replace('www.', '')
        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
