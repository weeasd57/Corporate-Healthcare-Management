import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // الصفحات العامة التي لا تحتاج مصادقة
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register/company',
    '/auth/register/hospital',
    '/api/auth/callback',
  ]

  // التحقق من أن الصفحة عامة
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // إذا لم يكن في صفحة عامة، توجيه للمصادقة
  if (!isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    // use `redirect` param name to align with login page usage
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// تكوين الـ middleware للعمل على مسارات محددة
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}