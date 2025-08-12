'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Stethoscope, 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
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

const checkupTypes = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'annual', label: 'فحص سنوي' },
  { value: 'pre_employment', label: 'فحص ما قبل التوظيف' },
  { value: 'periodic', label: 'فحص دوري' },
  { value: 'special', label: 'فحص خاص' }
]

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'scheduled', label: 'مجدول' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'no_show', label: 'لم يحضر' }
]

const resultOptions = [
  { value: '', label: 'جميع النتائج' },
  { value: 'passed', label: 'ناجح' },
  { value: 'failed', label: 'فاشل' },
  { value: 'needs_followup', label: 'يحتاج متابعة' }
]

export default function EmployeeCheckupsPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, checkups, hospitals } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [employeeCheckups, setEmployeeCheckups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedResult, setSelectedResult] = useState('')
  const [filteredCheckups, setFilteredCheckups] = useState([])

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

      // Filter checkups for this employee
      const employeeChecks = checkups.filter(checkup => checkup.employee_id === foundEmployee.id)
      setEmployeeCheckups(employeeChecks)

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
  }, [employees, checkups, params.id, addNotification, router])

  useEffect(() => {
    filterCheckups()
  }, [employeeCheckups, searchTerm, selectedType, selectedStatus, selectedResult, filterCheckups])

  const filterCheckups = useCallback(() => {
    let filtered = [...employeeCheckups]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(checkup => 
        checkup.checkup_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkup.doctor_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkup.recommendations?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(checkup => checkup.checkup_type === selectedType)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(checkup => checkup.status === selectedStatus)
    }

    // Filter by result
    if (selectedResult) {
      filtered = filtered.filter(checkup => checkup.result_summary === selectedResult)
    }

    setFilteredCheckups(filtered)
  }, [employeeCheckups, searchTerm, selectedType, selectedStatus, selectedResult])

  const handleAddCheckup = () => {
    router.push(`/employees/${employee.id}/checkups/add`)
  }

  const handleViewCheckup = (checkup) => {
    router.push(`/employees/${employee.id}/checkups/${checkup.id}`)
  }

  const handleEditCheckup = (checkup) => {
    router.push(`/employees/${employee.id}/checkups/${checkup.id}/edit`)
  }

  const handleDeleteCheckup = async (checkup) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفحص الطبي؟')) return

    try {
      const { error } = await db.deleteCheckup(checkup.id)
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الفحص الطبي بنجاح'
      })
      
      // Refresh data
      loadEmployeeData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء حذف الفحص الطبي'
      })
    }
  }

  const getCheckupTypeText = (type) => {
    switch (type) {
      case 'annual': return 'فحص سنوي'
      case 'pre_employment': return 'فحص ما قبل التوظيف'
      case 'periodic': return 'فحص دوري'
      case 'special': return 'فحص خاص'
      default: return type
    }
  }

  const getResultText = (result) => {
    switch (result) {
      case 'passed': return 'ناجح'
      case 'failed': return 'فاشل'
      case 'needs_followup': return 'يحتاج متابعة'
      default: return result
    }
  }

  const tableColumns = [
    {
      key: 'checkup_type',
      label: 'نوع الفحص',
      render: (checkup) => (
        <div className="flex items-center">
          <Stethoscope className="h-4 w-4 text-green-600 ml-2" />
          <span className="text-sm font-medium text-gray-900">
            {getCheckupTypeText(checkup.checkup_type)}
          </span>
        </div>
      )
    },
    {
      key: 'scheduled_date',
      label: 'التاريخ المحدد',
      render: (checkup) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(checkup.scheduled_date)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(checkup.scheduled_date).toLocaleTimeString('ar-SA', {
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
      render: (checkup) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-blue-600 ml-2" />
          <span className="text-sm text-gray-600">
            {checkup.hospital?.name || 'غير محدد'}
          </span>
        </div>
      )
    },
    {
      key: 'doctor',
      label: 'الطبيب',
      render: (checkup) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-purple-600 ml-2" />
          <span className="text-sm text-gray-600">
            {checkup.doctor ? `${checkup.doctor.first_name} ${checkup.doctor.last_name}` : 'غير محدد'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (checkup) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(checkup.status)}`}>
          {getStatusText(checkup.status)}
        </span>
      )
    },
    {
      key: 'result_summary',
      label: 'النتيجة',
      render: (checkup) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          checkup.result_summary === 'passed' ? 'bg-green-100 text-green-800' :
          checkup.result_summary === 'failed' ? 'bg-red-100 text-red-800' :
          checkup.result_summary === 'needs_followup' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getResultText(checkup.result_summary) || 'غير محدد'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (checkup) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleViewCheckup(checkup)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditCheckup(checkup)}
            className="p-1 text-green-600 hover:text-green-800"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCheckup(checkup)}
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
                  الفحوصات الطبية
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
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الفحوصات</p>
                <p className="text-2xl font-bold text-gray-900">{employeeCheckups.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الفحوصات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeCheckups.filter(checkup => checkup.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الفحوصات المعلقة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeCheckups.filter(checkup => checkup.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الفحوصات القادمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeCheckups.filter(checkup => {
                    const checkupDate = new Date(checkup.scheduled_date)
                    const now = new Date()
                    return checkupDate > now && checkup.status === 'scheduled'
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
                  placeholder="البحث في الفحوصات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Select
                options={checkupTypes}
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
              
              <Select
                options={resultOptions}
                value={selectedResult}
                onChange={(e) => setSelectedResult(e.target.value)}
                placeholder="اختر النتيجة"
              />
            </div>
            
            <Button
              onClick={handleAddCheckup}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة فحص طبي
            </Button>
          </div>
        </Card>

        {/* Checkups Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              قائمة الفحوصات الطبية ({filteredCheckups.length})
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

          {filteredCheckups.length > 0 ? (
            <Table
              data={filteredCheckups}
              columns={tableColumns}
              keyField="id"
            />
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد فحوصات طبية
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedType || selectedStatus || selectedResult
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم إضافة أي فحوصات طبية بعد'
                }
              </p>
              <Button
                onClick={handleAddCheckup}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول فحص طبي
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}