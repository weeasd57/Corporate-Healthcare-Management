'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Users, 
  ArrowLeft, 
  Edit, 
  Calendar,
  FileText,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Clock
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import { db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

export default function EmployeeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, appointments, sickLeaves, checkups } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userData) {
      router.push('/auth/login')
      return
    }

    if (!userData.role.startsWith('company_')) {
      router.push('/auth/login')
      return
    }

    loadEmployeeData()
  }, [userData, router, params.id, loadEmployeeData])

  const loadEmployeeData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Find employee in the list
      const foundEmployee = employees.find(emp => emp.id === params.id)
      if (!foundEmployee) {
        addNotification({
          type: 'error',
          title: 'خطأ',
          message: 'لم يتم العثور على الموظف'
        })
        router.push('/employees')
        return
      }

      setEmployee(foundEmployee)

      // Load medical record
      const { data: medicalData } = await db.getMedicalRecord(foundEmployee.id)
      setMedicalRecord(medicalData)

    } catch (error) {
      console.error('Load employee data error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تحميل بيانات الموظف'
      })
    } finally {
      setLoading(false)
    }
  }, [employees, params.id, addNotification, router])

  const handleEditEmployee = () => {
    router.push(`/employees/${employee.id}/edit`)
  }

  const handleViewMedicalRecord = () => {
    router.push(`/employees/${employee.id}/medical`)
  }

  const handleViewAppointments = () => {
    router.push(`/employees/${employee.id}/appointments`)
  }

  const handleViewSickLeaves = () => {
    router.push(`/employees/${employee.id}/sick-leaves`)
  }

  const handleViewCheckups = () => {
    router.push(`/employees/${employee.id}/checkups`)
  }

  // Filter data for this employee
  const employeeAppointments = appointments.filter(apt => apt.employee_id === employee?.id)
  const employeeSickLeaves = sickLeaves.filter(leave => leave.employee_id === employee?.id)
  const employeeCheckups = checkups.filter(checkup => checkup.employee_id === employee?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لم يتم العثور على الموظف
          </h3>
          <Button onClick={() => router.push('/employees')}>
            العودة لقائمة الموظفين
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/employees')}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لقائمة الموظفين
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  تفاصيل الموظف
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditEmployee}
              >
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">المعلومات الأساسية</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {employee.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الاسم الكامل</p>
                    <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">رقم الموظف</p>
                    <p className="font-medium">{employee.employee_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">القسم</p>
                    <p className="font-medium">{employee.department || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الوظيفة</p>
                    <p className="font-medium">{employee.position || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">تاريخ التوظيف</p>
                    <p className="font-medium">{formatDate(employee.hire_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الدور</p>
                    <p className="font-medium">{employee.role}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Medical Record Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">السجل الطبي</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewMedicalRecord}
                >
                  <Stethoscope className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Button>
              </div>
              
              {medicalRecord ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">الحالة الصحية</p>
                    <p className="font-medium">{medicalRecord.health_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">آخر تحديث</p>
                    <p className="font-medium">{formatDate(medicalRecord.updated_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">لا يوجد سجل طبي</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات سريعة</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">المواعيد</span>
                  </div>
                  <span className="font-medium">{employeeAppointments.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">الإجازات المرضية</span>
                  </div>
                  <span className="font-medium">{employeeSickLeaves.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">الفحوصات</span>
                  </div>
                  <span className="font-medium">{employeeCheckups.length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleViewAppointments}
                >
                  <Calendar className="h-4 w-4 ml-2" />
                  عرض المواعيد
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleViewSickLeaves}
                >
                  <FileText className="h-4 w-4 ml-2" />
                  عرض الإجازات
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleViewCheckups}
                >
                  <Stethoscope className="h-4 w-4 ml-2" />
                  عرض الفحوصات
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
              
              <div className="space-y-3">
                {employeeAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3 space-x-reverse">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">موعد طبي</p>
                      <p className="text-xs text-gray-500">{formatDate(appointment.appointment_date)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                ))}
                
                {employeeAppointments.length === 0 && (
                  <p className="text-sm text-gray-500">لا توجد نشاطات حديثة</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}