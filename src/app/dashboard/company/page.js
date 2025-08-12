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
  const { userData, organization, signOut, loading: authLoading } = useAuth()
  const { employees, appointments, sickLeaves, checkups, contracts, loading } = useData()
  const { addNotification } = useApp()

  useEffect(() => {
    if (authLoading) return
    if (!userData) {
      router.push('/auth/login')
      return
    }
    if (!userData.role?.startsWith('company_')) {
      router.push('/auth/login')
      return
    }
  }, [authLoading, userData, router])

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {organization?.name || 'Company Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome {userData?.first_name} {userData?.last_name}
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
                Add Employee
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Sick Leaves</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingSickLeaves}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upcoming Checkups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.upcomingCheckups}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalContracts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Employees */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Employees</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/employees')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/60 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{employee.department || 'Not specified'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No employees yet</p>
              )}
            </div>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Appointments</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/appointments')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/60 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {appointment.employee?.first_name} {appointment.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/employees/add')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>Add Employee</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/appointments/book')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Book Appointment</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/checkups/schedule')}
            >
              <Stethoscope className="h-6 w-6 mb-2" />
              <span>Schedule Checkup</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/reports')}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Reports</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}