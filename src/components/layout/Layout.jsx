import { useState } from 'react'
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
  Stethoscope
} from 'lucide-react'
import { cn } from '@/lib/utils'

const Layout = ({ 
  children, 
  title = 'تطبيق الشركة والمستشفى',
  user = null,
  organization = null 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'الموظفين', href: '/employees', icon: Users },
    { name: 'المواعيد', href: '/appointments', icon: Calendar },
    { name: 'التقارير', href: '/reports', icon: FileText },
    { name: 'الإعدادات', href: '/settings', icon: Settings },
  ]

  const isHospital = organization?.type === 'hospital'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-l border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              {isHospital ? (
                <Stethoscope className="h-8 w-8 text-blue-600" />
              ) : (
                <Building2 className="h-8 w-8 text-green-600" />
              )}
              <h1 className="mr-3 text-lg font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
          
          {/* Organization info */}
          {organization && (
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{organization.name}</p>
              <p className="text-xs text-gray-500">
                {isHospital ? 'مستشفى' : 'شركة'}
              </p>
            </div>
          )}

          {/* User info */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-4">
            <button className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <LogOut className="ml-3 h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
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
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Add notifications, profile, etc. here */}
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