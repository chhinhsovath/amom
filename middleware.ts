import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/')
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth/')
  const isApiSeed = request.nextUrl.pathname === '/api/seed'
  const isHomePage = request.nextUrl.pathname === '/'

  // Allow access to auth pages, api auth routes, seed route, and home page
  if (isAuthPage || isApiAuth || isApiSeed || isHomePage) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    const url = new URL('/auth/login', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}