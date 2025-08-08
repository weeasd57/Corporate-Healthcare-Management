'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Calendar, 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Clock,
  MapPin,
  User,
  Building2
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import { db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

const appointmentTypes = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'checkup', label: 'فحص طبي' },
  { value: 'consultation', label: 'استشارة' },
  { value: 'followup', label: 'متابعة' }
]

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'scheduled', label: 'مجدول' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'no_show', label: 'لم يحضر' }
]

export default function EmployeeAppointmentsPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, appointments, hospitals } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [employeeAppointments, setEmployeeAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [filteredAppointments, setFilteredAppointments] = useState([])

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

      // Filter appointments for this employee
      const employeeApts = appointments.filter(apt => apt.employee_id === foundEmployee.id)
      setEmployeeAppointments(employeeApts)

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
  }, [employees, appointments, params.id, addNotification, router])

  useEffect(() => {
    filterAppointments()
  }, [employeeAppointments, searchTerm, selectedType, selectedStatus, filterAppointments])

  const filterAppointments = useCallback(() => {
    let filtered = [...employeeAppointments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(apt => apt.appointment_type === selectedType)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(apt => apt.status === selectedStatus)
    }

    setFilteredAppointments(filtered)
  }, [employeeAppointments, searchTerm, selectedType, selectedStatus])

  const handleAddAppointment = () => {
    router.push(`/employees/${employee.id}/appointments/add`)
  }

  const handleViewAppointment = (appointment) => {
    router.push(`/employees/${employee.id}/appointments/${appointment.id}`)
  }

  const handleEditAppointment = (appointment) => {
    router.push(`/employees/${employee.id}/appointments/${appointment.id}/edit`)
  }

  const handleDeleteAppointment = async (appointment) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return

    try {
      const { error } = await db.deleteAppointment(appointment.id)
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الموعد بنجاح'
      })
      
      // Refresh data
      loadEmployeeData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء حذف الموعد'
      })
    }
  }

  const tableColumns = [
    {
      key: 'appointment_type',
      label: 'نوع الموعد',
      render: (appointment) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-600 ml-2" />
          <span className="text-sm font-medium text-gray-900">
            {appointment.appointment_type === 'checkup' ? 'فحص طبي' :
             appointment.appointment_type === 'consultation' ? 'استشارة' :
             appointment.appointment_type === 'followup' ? 'متابعة' :
             appointment.appointment_type}
          </span>
        </div>
      )
    },
    {
      key: 'appointment_date',
      label: 'التاريخ والوقت',
      render: (appointment) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(appointment.appointment_date)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(appointment.appointment_date).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      render: (appointment) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-green-600 ml-2" />
          <span className="text-sm text-gray-600">
            {appointment.hospital?.name || 'غير محدد'}
          </span>
        </div>
      )
    },
    {
      key: 'doctor',
      label: 'الطبيب',
      render: (appointment) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-purple-600 ml-2" />
          <span className="text-sm text-gray-600">
            {appointment.doctor ? `${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 'غير محدد'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (appointment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (appointment) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleViewAppointment(appointment)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditAppointment(appointment)}
            className="p-1 text-green-600 hover:text-green-800"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteAppointment(appointment)}
            className="p-1 text-red-600 hover:text-red-800"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

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

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gray-50">
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
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  مواعيد الموظف
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                {employee.first_name} {employee.last_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المواعيد</p>
                <p className="text-2xl font-bold text-gray-900">{employeeAppointments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المواعيد المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeAppointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المواعيد المعلقة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeAppointments.filter(apt => apt.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المواعيد القادمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeAppointments.filter(apt => {
                    const aptDate = new Date(apt.appointment_date)
                    const now = new Date()
                    return aptDate > now && apt.status === 'scheduled'
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Input
                  placeholder="البحث في المواعيد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Select
                options={appointmentTypes}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                placeholder="اختر النوع"
              />
              
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                placeholder="اختر الحالة"
              />
            </div>
            
            <Button
              onClick={handleAddAppointment}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة موعد جديد
            </Button>
          </div>
        </Card>

        {/* Appointments Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              قائمة المواعيد ({filteredAppointments.length})
            </h3>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEmployeeData}
              >
                تحديث
              </Button>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <Table
              data={filteredAppointments}
              columns={tableColumns}
              keyField="id"
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد مواعيد
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedType || selectedStatus 
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم إضافة أي مواعيد بعد'
                }
              </p>
              <Button
                onClick={handleAddAppointment}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول موعد
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}