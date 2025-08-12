import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Public pages that do not require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/register/company',
    '/auth/register/hospital',
    '/favicon.ico'
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Allow all requests to proceed; client-side providers handle auth/redirects
  return NextResponse.next()
}

// Configure middleware to run on specific routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}