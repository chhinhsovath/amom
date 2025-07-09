import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname === '/api/seed') {
          return true
        }
        // Require token for all other pages
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}