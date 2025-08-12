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

  // If not on a public page, redirect to auth
  if (!isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// Configure middleware to run on specific routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}