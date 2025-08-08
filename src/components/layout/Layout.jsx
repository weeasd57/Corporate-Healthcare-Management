import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  Stethoscope,
  UserPlus,
  Heart,
  FileHeart,
  Pills,
  DollarSign,
  BarChart3,
  Bell,
  ClipboardList,
  UserCheck,
  Hospital
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/supabase'

const Layout = ({ 
  children, 
  title = 'تطبيق الشركة والمستشفى',
  user = null,
  organization = null 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isHospital = organization?.type === 'hospital'
  const isCompany = organization?.type === 'company'

  // Navigation items based on organization type
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'الرئيسية', href: isHospital ? '/dashboard/hospital' : '/dashboard/company', icon: Home },
    ]

    if (isCompany) {
      return [
        ...baseItems,
        { name: 'الموظفين', href: '/employees', icon: Users },
        { name: 'إضافة موظف', href: '/employees/add', icon: UserPlus },
        { name: 'المواعيد', href: '/appointments', icon: Calendar },
        { name: 'السجلات الطبية', href: '/medical-records', icon: FileHeart },
        { name: 'الإجازات المرضية', href: '/sick-leaves', icon: Heart },
        { name: 'الفحوصات', href: '/checkups', icon: ClipboardList },
        { name: 'التقارير', href: '/reports', icon: BarChart3 },
        { name: 'الإعدادات', href: '/settings', icon: Settings },
      ]
    } else if (isHospital) {
      return [
        ...baseItems,
        { name: 'الشركات العميلة', href: '/clients', icon: Building2 },
        { name: 'المواعيد اليومية', href: '/appointments/daily', icon: Calendar },
        { name: 'الملفات الطبية', href: '/medical-files', icon: FileText },
        { name: 'الأدوية والوصفات', href: '/pharmacy', icon: Pills },
        { name: 'الفوترة', href: '/billing', icon: DollarSign },
        { name: 'التقارير الطبية', href: '/reports/medical', icon: BarChart3 },
        { name: 'الإعدادات', href: '/settings', icon: Settings },
      ]
    }

    return baseItems
  }

  const navigation = getNavigationItems()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error)
    }
  }

  const isActive = (href) => {
    if (href === '/dashboard/company' || href === '/dashboard/hospital') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const NavigationItem = ({ item, mobile = false }) => (
    <a
      href={item.href}
      className={cn(
        "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
        isActive(item.href)
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        mobile && "text-base"
      )}
    >
      <item.icon className={cn(
        "ml-3 h-5 w-5",
        isActive(item.href) ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
      )} />
      {item.name}
    </a>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              {isHospital ? (
                <Stethoscope className="h-6 w-6 text-blue-600" />
              ) : (
                <Building2 className="h-6 w-6 text-green-600" />
              )}
              <h1 className="mr-2 text-sm font-semibold text-gray-900 truncate">
                {organization?.name || title}
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Organization and User info */}
          {(organization || user) && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              {organization && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{organization.name}</p>
                  <p className="text-xs text-gray-500">
                    {isHospital ? 'مستشفى' : 'شركة'}
                  </p>
                </div>
              )}
              {user && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              )}
            </div>
          )}

          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <NavigationItem key={item.name} item={item} mobile={true} />
            ))}
          </nav>

          {/* Mobile Logout */}
          <div className="border-t border-gray-200 p-4">
            <button 
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="ml-3 h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-l border-gray-200 shadow-lg">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center w-full">
              {isHospital ? (
                <Stethoscope className="h-8 w-8 text-blue-600" />
              ) : (
                <Building2 className="h-8 w-8 text-green-600" />
              )}
              <h1 className="mr-3 text-lg font-semibold text-gray-900 truncate">
                {organization?.name || title}
              </h1>
            </div>
          </div>
          
          {/* Organization and User info */}
          {(organization || user) && (
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              {organization && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{organization.name}</p>
                  <div className="flex items-center mt-1">
                    {isHospital ? (
                      <Hospital className="h-4 w-4 text-blue-500 ml-1" />
                    ) : (
                      <Building2 className="h-4 w-4 text-green-500 ml-1" />
                    )}
                    <p className="text-xs text-gray-500">
                      {isHospital ? 'مستشفى' : 'شركة'}
                    </p>
                  </div>
                </div>
              )}
              {user && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <div className="flex items-center mt-1">
                    <UserCheck className="h-4 w-4 text-gray-400 ml-1" />
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Desktop Logout */}
          <div className="border-t border-gray-200 p-4">
            <button 
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="ml-3 h-5 w-5 group-hover:text-red-700" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              {/* Breadcrumb or page title can go here */}
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => isActive(item.href))?.name || 'الصفحة الرئيسية'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Quick stats or info */}
              {organization && (
                <div className="hidden sm:flex items-center text-sm text-gray-500">
                  <span className="ml-2">{isHospital ? 'مستشفى' : 'شركة'}</span>
                  <span>{organization.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout