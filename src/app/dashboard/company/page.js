'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Building2, 
  Stethoscope,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

export default function CompanyDashboard() {
  const router = useRouter()
  const { userData, organization, signOut } = useAuth()
  const { employees, appointments, sickLeaves, checkups, contracts, loading } = useData()
  const { addNotification } = useApp()

  useEffect(() => {
    if (!userData) {
      router.push('/auth/login')
      return
    }

    if (!userData.role.startsWith('company_')) {
      router.push('/auth/login')
      return
    }
  }, [userData, router])

  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تسجيل الخروج'
      })
    }
  }

  // Calculate stats from data
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.is_active).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
    pendingSickLeaves: sickLeaves.filter(leave => leave.status === 'pending').length,
    upcomingCheckups: checkups.filter(checkup => checkup.status === 'scheduled').length,
    totalContracts: contracts.length
  }

  const recentEmployees = employees.slice(0, 5)
  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled').slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {organization?.name || 'لوحة تحكم الشركة'}
                </h1>
                <p className="text-sm text-gray-500">
                  مرحباً {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/employees/add')}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة موظف
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الموظفين النشطين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المواعيد المعلقة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الإجازات المعلقة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSickLeaves}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الفحوصات القادمة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingCheckups}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">التعاقدات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Employees */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">آخر الموظفين</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/employees')}
              >
                عرض الكل
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{employee.department || 'غير محدد'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {employee.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">لا يوجد موظفين بعد</p>
              )}
            </div>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">المواعيد القادمة</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/appointments')}
              >
                عرض الكل
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.employee?.first_name} {appointment.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(appointment.appointment_date)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد مواعيد قادمة</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/employees/add')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>إضافة موظف</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/appointments/book')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>حجز موعد</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/checkups/schedule')}
            >
              <Stethoscope className="h-6 w-6 mb-2" />
              <span>جدولة فحص</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/reports')}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>التقارير</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}