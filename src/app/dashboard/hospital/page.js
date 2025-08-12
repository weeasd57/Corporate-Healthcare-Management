'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Stethoscope,
  Building2,
  Plus,
  Search,
  Filter,
  DollarSign
} from 'lucide-react'
import { auth, db } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider' // Import useAuth
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

export default function HospitalDashboard() {
  const router = useRouter()
  const { userData, organization, loading: authLoading } = useAuth() // Use userData, organization from AuthProvider
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    activeContracts: 0,
    monthlyRevenue: 0
  })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(true) // Local loading state for dashboard data

  useEffect(() => {
    if (userData && organization) {
      loadDashboardData()
    } else if (!authLoading && !userData) {
      // If auth is done loading and no user, redirect to login
      router.push('/auth/login')
    }
  }, [userData, organization, authLoading])

  // Remove checkAuth as AuthProvider handles it
  // const checkAuth = async () => { ... } 

  const loadDashboardData = async () => {
    // Ensure user and organization are available from useAuth
    if (!userData || !organization) return

    try {
      setLoading(true)
      
      // Load all data in parallel using Promise.all
      const [
        { data: staff },
        { data: todayAppointments },
        { data: pendingAppointments },
        { data: contracts },
        { data: allAppointments }
      ] = await Promise.all([
        db.getUsersByOrganization(userData.organization_id),
        db.getAppointments({
          hospitalId: userData.organization_id,
          dateFrom: new Date().toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0]
        }),
        db.getAppointments({
          hospitalId: userData.organization_id,
          status: 'scheduled'
        }),
        db.getContracts({
          hospitalId: userData.organization_id,
          status: 'active'
        }),
        db.getAppointments({
          hospitalId: userData.organization_id,
          limit: 10 // Limit to recent appointments only
        })
      ])

      // Process data
      const doctors = staff?.filter(s => s.role === 'doctor') || []
      const nurses = staff?.filter(s => s.role === 'nurse') || []
      
      // Get unique patients from recent appointments
      const uniquePatients = allAppointments?.reduce((acc, appointment) => {
        if (appointment.employee && !acc.find(p => p.id === appointment.employee.id)) {
          acc.push(appointment.employee)
        }
        return acc
      }, []) || []

      // Update state
      setStats({
        totalDoctors: doctors.length,
        totalNurses: nurses.length,
        todayAppointments: todayAppointments?.length || 0,
        pendingAppointments: pendingAppointments?.length || 0,
        activeContracts: contracts?.length || 0,
        monthlyRevenue: contracts?.reduce((sum, contract) => sum + (contract.rates?.monthly || 0), 0) || 0
      })
      
      setTodayAppointments(todayAppointments || [])
      setRecentPatients(uniquePatients.slice(0, 5)) // Show only 5 recent patients
      
    } catch (error) {
      console.error('Dashboard data loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading spinner if auth is still loading or dashboard data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {organization?.name || 'Hospital Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                                     Welcome {userData?.first_name} {userData?.last_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/appointments/today')}
              >
                <Calendar className="h-4 w-4 ml-2" />
                Today's Appointments
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
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Nurses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNurses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toLocaleString()} SAR</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/appointments/today')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {appointment.employee?.first_name?.charAt(0)}{appointment.employee?.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.employee?.first_name} {appointment.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(appointment.appointment_date, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments today</p>
              )}
            </div>
          </Card>

          {/* Recent Patients */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/patients')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-3">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{patient.employee_id || 'Not specified'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {patient.organization?.name || 'Not specified'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No patients yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/appointments/today')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Today's Appointments</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/patients/new')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>New Patient</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/prescriptions/new')}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Prescription</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/invoices/new')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span>New Invoice</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}