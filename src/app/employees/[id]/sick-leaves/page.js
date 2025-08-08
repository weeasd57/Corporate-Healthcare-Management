'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  FileText, 
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
  User
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

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'pending', label: 'في الانتظار' },
  { value: 'approved', label: 'موافق عليه' },
  { value: 'rejected', label: 'مرفوض' }
]

export default function EmployeeSickLeavesPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, sickLeaves } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [employeeSickLeaves, setEmployeeSickLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [filteredSickLeaves, setFilteredSickLeaves] = useState([])

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

      // Filter sick leaves for this employee
      const employeeLeaves = sickLeaves.filter(leave => leave.employee_id === foundEmployee.id)
      setEmployeeSickLeaves(employeeLeaves)

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
  }, [employees, sickLeaves, params.id, addNotification, router])

  useEffect(() => {
    filterSickLeaves()
  }, [employeeSickLeaves, searchTerm, selectedStatus, filterSickLeaves])

  const filterSickLeaves = useCallback(() => {
    let filtered = [...employeeSickLeaves]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(leave => 
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.hr_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(leave => leave.status === selectedStatus)
    }

    setFilteredSickLeaves(filtered)
  }, [employeeSickLeaves, searchTerm, selectedStatus])

  const handleAddSickLeave = () => {
    router.push(`/employees/${employee.id}/sick-leaves/add`)
  }

  const handleViewSickLeave = (sickLeave) => {
    router.push(`/employees/${employee.id}/sick-leaves/${sickLeave.id}`)
  }

  const handleEditSickLeave = (sickLeave) => {
    router.push(`/employees/${employee.id}/sick-leaves/${sickLeave.id}/edit`)
  }

  const handleDeleteSickLeave = async (sickLeave) => {
    if (!confirm('هل أنت متأكد من حذف هذه الإجازة المرضية؟')) return

    try {
      const { error } = await db.deleteSickLeave(sickLeave.id)
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الإجازة المرضية بنجاح'
      })
      
      // Refresh data
      loadEmployeeData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء حذف الإجازة المرضية'
      })
    }
  }

  const handleApproveSickLeave = async (sickLeave) => {
    try {
      const { error } = await db.updateSickLeave(sickLeave.id, {
        status: 'approved',
        approved_by: userData.id,
        approved_at: new Date().toISOString()
      })
      
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تمت الموافقة',
        message: 'تمت الموافقة على الإجازة المرضية بنجاح'
      })
      
      loadEmployeeData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء الموافقة على الإجازة'
      })
    }
  }

  const handleRejectSickLeave = async (sickLeave) => {
    const rejectionReason = prompt('سبب الرفض:')
    if (!rejectionReason) return

    try {
      const { error } = await db.updateSickLeave(sickLeave.id, {
        status: 'rejected',
        approved_by: userData.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      
      if (error) throw error
      
      addNotification({
        type: 'success',
        title: 'تم الرفض',
        message: 'تم رفض الإجازة المرضية'
      })
      
      loadEmployeeData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء رفض الإجازة'
      })
    }
  }

  const tableColumns = [
    {
      key: 'date_range',
      label: 'فترة الإجازة',
      render: (sickLeave) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(sickLeave.start_date)} - {formatDate(sickLeave.end_date)}
          </p>
          <p className="text-xs text-gray-500">
            {sickLeave.days_count} يوم
          </p>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'سبب الإجازة',
      render: (sickLeave) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">
            {sickLeave.reason}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (sickLeave) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sickLeave.status)}`}>
          {getStatusText(sickLeave.status)}
        </span>
      )
    },
    {
      key: 'approved_by',
      label: 'تمت المراجعة بواسطة',
      render: (sickLeave) => (
        <div className="text-sm text-gray-600">
          {sickLeave.approved_by ? (
            <span>تمت المراجعة</span>
          ) : (
            <span className="text-yellow-600">في الانتظار</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'تاريخ الطلب',
      render: (sickLeave) => (
        <span className="text-sm text-gray-600">
          {formatDate(sickLeave.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (sickLeave) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleViewSickLeave(sickLeave)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {sickLeave.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveSickLeave(sickLeave)}
                className="p-1 text-green-600 hover:text-green-800"
                title="موافقة"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRejectSickLeave(sickLeave)}
                className="p-1 text-red-600 hover:text-red-800"
                title="رفض"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => handleEditSickLeave(sickLeave)}
            className="p-1 text-green-600 hover:text-green-800"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleDeleteSickLeave(sickLeave)}
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
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  الإجازات المرضية
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
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الإجازات</p>
                <p className="text-2xl font-bold text-gray-900">{employeeSickLeaves.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الإجازات الموافق عليها</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeSickLeaves.filter(leave => leave.status === 'approved').length}
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
                <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeSickLeaves.filter(leave => leave.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المرفوضة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employeeSickLeaves.filter(leave => leave.status === 'rejected').length}
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
                  placeholder="البحث في الإجازات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                placeholder="اختر الحالة"
              />
            </div>
            
            <Button
              onClick={handleAddSickLeave}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة إجازة مرضية
            </Button>
          </div>
        </Card>

        {/* Sick Leaves Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              قائمة الإجازات المرضية ({filteredSickLeaves.length})
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

          {filteredSickLeaves.length > 0 ? (
            <Table
              data={filteredSickLeaves}
              columns={tableColumns}
              keyField="id"
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد إجازات مرضية
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus 
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم إضافة أي إجازات مرضية بعد'
                }
              </p>
              <Button
                onClick={handleAddSickLeave}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول إجازة مرضية
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}