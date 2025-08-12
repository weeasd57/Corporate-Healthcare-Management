'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Stethoscope, 
  ArrowLeft, 
  Edit, 
  Plus,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import { db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

export default function EmployeeMedicalRecordPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, appointments, checkups } = useData()
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

  const handleEditMedicalRecord = () => {
    router.push(`/employees/${employee.id}/medical/edit`)
  }

  const handleViewAppointments = () => {
    router.push(`/employees/${employee.id}/appointments`)
  }

  const handleViewCheckups = () => {
    router.push(`/employees/${employee.id}/checkups`)
  }

  // Filter data for this employee
  const employeeAppointments = appointments.filter(apt => apt.employee_id === employee?.id)
  const employeeCheckups = checkups.filter(checkup => checkup.employee_id === employee?.id)

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'صحي'
      case 'warning':
        return 'تحتاج مراقبة'
      case 'critical':
        return 'حرج'
      default:
        return 'غير محدد'
    }
  }

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
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                onClick={() => router.push(`/employees/${employee.id}`)}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لتفاصيل الموظف
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Stethoscope className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  السجل الطبي
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditMedicalRecord}
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
          {/* Medical Record Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Info */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">معلومات الموظف</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getHealthStatusColor(medicalRecord?.health_status)}`}>
                  {getHealthStatusText(medicalRecord?.health_status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">الاسم الكامل</p>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">رقم الموظف</p>
                  <p className="font-medium">{employee.employee_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">القسم</p>
                  <p className="font-medium">{employee.department || 'غير محدد'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">تاريخ التوظيف</p>
                  <p className="font-medium">{formatDate(employee.hire_date)}</p>
                </div>
              </div>
            </Card>

            {/* Medical Record Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">تفاصيل السجل الطبي</h3>
              
              {medicalRecord ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">الحالة الصحية</p>
                      <p className="font-medium">{medicalRecord.health_status}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">آخر تحديث</p>
                      <p className="font-medium">{formatDate(medicalRecord.updated_at)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                      <p className="font-medium">{formatDate(medicalRecord.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">ملاحظات طبية</p>
                      <p className="font-medium">{medicalRecord.notes || 'لا توجد ملاحظات'}</p>
                    </div>
                  </div>

                  {medicalRecord.allergies && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">الحساسية</p>
                      <p className="font-medium">{medicalRecord.allergies}</p>
                    </div>
                  )}

                  {medicalRecord.chronic_conditions && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">الأمراض المزمنة</p>
                      <p className="font-medium">{medicalRecord.chronic_conditions}</p>
                    </div>
                  )}

                  {medicalRecord.medications && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">الأدوية الحالية</p>
                      <p className="font-medium">{medicalRecord.medications}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    لا يوجد سجل طبي
                  </h4>
                  <p className="text-gray-500 mb-4">
                    لم يتم إنشاء سجل طبي لهذا الموظف بعد
                  </p>
                  <Button onClick={handleEditMedicalRecord}>
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء سجل طبي
                  </Button>
                </div>
              )}
            </Card>

            {/* Recent Medical Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">النشاط الطبي الأخير</h3>
              
              <div className="space-y-4">
                {employeeAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">موعد طبي</p>
                      <p className="text-xs text-gray-500">{formatDate(appointment.appointment_date)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {appointment.status === 'completed' ? 'مكتمل' : 'مجدول'}
                    </span>
                  </div>
                ))}

                {employeeCheckups.slice(0, 5).map((checkup) => (
                  <div key={checkup.id} className="flex items-center space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">فحص طبي</p>
                      <p className="text-xs text-gray-500">{formatDate(checkup.scheduled_date)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${checkup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {checkup.status === 'completed' ? 'مكتمل' : 'مجدول'}
                    </span>
                  </div>
                ))}

                {employeeAppointments.length === 0 && employeeCheckups.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">لا توجد نشاطات طبية حديثة</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات طبية</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">المواعيد الطبية</span>
                  </div>
                  <span className="font-medium">{employeeAppointments.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">الفحوصات الطبية</span>
                  </div>
                  <span className="font-medium">{employeeCheckups.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">المواعيد المكتملة</span>
                  </div>
                  <span className="font-medium">
                    {employeeAppointments.filter(apt => apt.status === 'completed').length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">المواعيد المعلقة</span>
                  </div>
                  <span className="font-medium">
                    {employeeAppointments.filter(apt => apt.status === 'scheduled').length}
                  </span>
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
                  عرض المواعيد الطبية
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleViewCheckups}
                >
                  <Stethoscope className="h-4 w-4 ml-2" />
                  عرض الفحوصات الطبية
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleEditMedicalRecord}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل السجل الطبي
                </Button>
              </div>
            </Card>

            {/* Health Alerts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات صحية</h3>
              
              <div className="space-y-3">
                {medicalRecord?.health_status === 'critical' && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-red-50 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">الحالة الصحية حرجة</span>
                  </div>
                )}

                {medicalRecord?.health_status === 'warning' && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">تحتاج مراقبة صحية</span>
                  </div>
                )}

                {medicalRecord?.health_status === 'healthy' && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">الحالة الصحية جيدة</span>
                  </div>
                )}

                {!medicalRecord && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-gray-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-800">لا يوجد سجل طبي</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}