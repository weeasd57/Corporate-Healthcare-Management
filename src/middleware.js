import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // التحقق من حالة المصادقة
  const {
    data: { session },
  } = await supabase.auth.getSession()

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

  // إذا لم يكن المستخدم مسجل دخول وليس في صفحة عامة
  if (!session && !isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // إذا كان المستخدم مسجل دخول وهو في صفحة مصادقة
  if (session && isPublicPath && pathname !== '/') {
    // الحصول على بيانات المستخدم من قاعدة البيانات
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_id', session.user.id)
      .single()

    if (userData) {
      // توجيه المستخدم للـ dashboard المناسب
      let dashboardPath = '/dashboard'
      
      if (userData.role.startsWith('company_')) {
        dashboardPath = '/dashboard/company'
      } else if (userData.role.startsWith('hospital_')) {
        dashboardPath = '/dashboard/hospital'
      }

      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = dashboardPath
      return NextResponse.redirect(redirectUrl)
    }
  }

  // التحقق من الصلاحيات للصفحات المحمية
  if (session && !isPublicPath) {
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_id', session.user.id)
      .single()

    if (userData) {
      // التحقق من صلاحيات الوصول للصفحات
      const hasAccess = checkPageAccess(pathname, userData.role)
      
      if (!hasAccess) {
        // توجيه المستخدم لصفحة غير مصرح له بالوصول إليها
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/unauthorized'
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return res
}

// دالة للتحقق من صلاحيات الوصول للصفحات
function checkPageAccess(pathname, userRole) {
  // صفحات الشركة
  const companyPages = [
    '/dashboard/company',
    '/employees',
    '/appointments',
    '/checkups',
    '/sick-leaves',
    '/reports',
    '/contracts'
  ]

  // صفحات المستشفى
  const hospitalPages = [
    '/dashboard/hospital',
    '/patients',
    '/appointments',
    '/prescriptions',
    '/invoices',
    '/medicines',
    '/reports'
  ]

  // صفحات عامة للمستخدمين المسجلين
  const generalPages = [
    '/dashboard',
    '/profile',
    '/settings',
    '/notifications'
  ]

  // التحقق من نوع المستخدم والصلاحيات
  if (userRole.startsWith('company_')) {
    return companyPages.some(page => pathname.startsWith(page)) || 
           generalPages.some(page => pathname.startsWith(page))
  }
  
  if (userRole.startsWith('hospital_')) {
    return hospitalPages.some(page => pathname.startsWith(page)) || 
           generalPages.some(page => pathname.startsWith(page))
  }

  // للمستخدمين الآخرين، السماح بالصفحات العامة فقط
  return generalPages.some(page => pathname.startsWith(page))
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