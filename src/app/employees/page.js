'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2,
  ArrowLeft,
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

const departments = [
  { value: '', label: 'جميع الأقسام' },
  { value: 'it', label: 'تقنية المعلومات' },
  { value: 'hr', label: 'الموارد البشرية' },
  { value: 'finance', label: 'المالية' },
  { value: 'marketing', label: 'التسويق' },
  { value: 'sales', label: 'المبيعات' },
  { value: 'operations', label: 'العمليات' },
  { value: 'legal', label: 'الشؤون القانونية' },
  { value: 'other', label: 'أخرى' }
]

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' }
]

export default function EmployeesPage() {
  const router = useRouter()
  const { userData, organization } = useAuth()
  const { employees, loading, refreshData } = useData()
  const { addNotification } = useApp()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [filteredEmployees, setFilteredEmployees] = useState([])

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

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, selectedDepartment, selectedStatus])

  const filterEmployees = () => {
    let filtered = [...employees]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === selectedDepartment)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(emp => 
        selectedStatus === 'active' ? emp.is_active : !emp.is_active
      )
    }

    setFilteredEmployees(filtered)
  }

  const handleViewEmployee = (employee) => {
    router.push(`/employees/${employee.id}`)
  }

  const handleEditEmployee = (employee) => {
    router.push(`/employees/${employee.id}/edit`)
  }

  const handleDeleteEmployee = async (employee) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

    try {
      const { error } = await db.deleteUser(employee.id)
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الموظف بنجاح'
      })
      
      refreshData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء حذف الموظف'
      })
    }
  }

  const tableColumns = [
    {
      key: 'name',
      label: 'الاسم',
      render: (employee) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </span>
          </div>
          <div className="mr-3">
            <p className="text-sm font-medium text-gray-900">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-gray-500">{employee.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'employee_id',
      label: 'رقم الموظف',
      render: (employee) => (
        <span className="text-sm text-gray-900">{employee.employee_id}</span>
      )
    },
    {
      key: 'department',
      label: 'القسم',
      render: (employee) => (
        <span className="text-sm text-gray-600">{employee.department || 'غير محدد'}</span>
      )
    },
    {
      key: 'position',
      label: 'الوظيفة',
      render: (employee) => (
        <span className="text-sm text-gray-600">{employee.position || 'غير محدد'}</span>
      )
    },
    {
      key: 'hire_date',
      label: 'تاريخ التوظيف',
      render: (employee) => (
        <span className="text-sm text-gray-600">{formatDate(employee.hire_date)}</span>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (employee) => (
        <span className={`px-2 py-1 text-xs rounded-full ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {employee.is_active ? 'نشط' : 'غير نشط'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (employee) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleViewEmployee(employee)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditEmployee(employee)}
            className="p-1 text-green-600 hover:text-green-800"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteEmployee(employee)}
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
                onClick={() => router.push('/dashboard/company')}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للوحة التحكم
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  إدارة الموظفين
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Building2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                {organization?.name}
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الموظفين النشطين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => emp.is_active).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الموظفين غير النشطين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => !emp.is_active).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الموظفين الجدد</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => {
                    const hireDate = new Date(emp.hire_date)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return hireDate >= thirtyDaysAgo
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
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Select
                options={departments}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                placeholder="اختر القسم"
              />
              
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                placeholder="اختر الحالة"
              />
            </div>
            
            <Button
              onClick={() => router.push('/employees/add')}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </div>
        </Card>

        {/* Employees Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              قائمة الموظفين ({filteredEmployees.length})
            </h3>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
              >
                تحديث
              </Button>
            </div>
          </div>

          {filteredEmployees.length > 0 ? (
            <Table
              data={filteredEmployees}
              columns={tableColumns}
              keyField="id"
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا يوجد موظفين
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedDepartment || selectedStatus 
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم إضافة أي موظفين بعد'
                }
              </p>
              <Button
                onClick={() => router.push('/employees/add')}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول موظف
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}