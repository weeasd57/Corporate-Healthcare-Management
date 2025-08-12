'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Plus,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import { db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Textarea from '@/components/ui/Textarea'

// Schema validation
const sickLeaveSchema = z.object({
  start_date: z.string().min(1, 'تاريخ بداية الإجازة مطلوب'),
  end_date: z.string().min(1, 'تاريخ نهاية الإجازة مطلوب'),
  reason: z.string().min(10, 'سبب الإجازة مطلوب (10 أحرف على الأقل)'),
  medical_certificate_url: z.string().optional(),
  hr_notes: z.string().optional()
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate >= startDate
}, {
  message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
  path: ["end_date"]
})

const leaveReasons = [
  { value: 'illness', label: 'مرض عام' },
  { value: 'surgery', label: 'عملية جراحية' },
  { value: 'accident', label: 'حادث' },
  { value: 'pregnancy', label: 'حمل وولادة' },
  { value: 'mental_health', label: 'صحة نفسية' },
  { value: 'chronic_condition', label: 'مرض مزمن' },
  { value: 'other', label: 'أخرى' }
]

export default function AddSickLeavePage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [daysCount, setDaysCount] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(sickLeaveSchema)
  })

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
      setInitialLoading(true)
      
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

      // Set default form values
      reset({
        start_date: '',
        end_date: '',
        reason: '',
        medical_certificate_url: '',
        hr_notes: ''
      })

    } catch (error) {
      console.error('Load employee data error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تحميل بيانات الموظف'
      })
    } finally {
      setInitialLoading(false)
    }
  }, [employees, params.id, addNotification, router, reset])

  // Watch dates to calculate days count
  const startDate = watch('start_date')
  const endDate = watch('end_date')

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setDaysCount(diffDays)
    } else {
      setDaysCount(0)
    }
  }, [startDate, endDate])

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const sickLeaveData = {
        employee_id: employee.id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        medical_certificate_url: data.medical_certificate_url || null,
        hr_notes: data.hr_notes || null,
        status: 'pending'
      }

      const { error } = await db.createSickLeave(sickLeaveData)
      
      if (error) throw error

      addNotification({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم إنشاء الإجازة المرضية بنجاح'
      })

      // Redirect to sick leaves list
      router.push(`/employees/${employee.id}/sick-leaves`)
      
    } catch (error) {
      console.error('Create sick leave error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: error.message || 'حدث خطأ أثناء إنشاء الإجازة المرضية'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getReasonText = (reason) => {
    const reasonObj = leaveReasons.find(r => r.value === reason)
    return reasonObj ? reasonObj.label : reason
  }

  if (initialLoading) {
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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/employees/${employee.id}/sick-leaves`)}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لإجازات الموظف
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Plus className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  إضافة إجازة مرضية
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              إضافة إجازة مرضية
            </h2>
            <p className="text-gray-600">
              قم بإنشاء إجازة مرضية جديدة للموظف {employee.first_name} {employee.last_name}
            </p>
          </div>

          {/* Sick Leave Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات الإجازة الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ بداية الإجازة *
                  </label>
                  <Input
                    {...register('start_date')}
                    type="date"
                    error={errors.start_date?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ نهاية الإجازة *
                  </label>
                  <Input
                    {...register('end_date')}
                    type="date"
                    error={errors.end_date?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الإجازة *
                  </label>
                  <Select
                    {...register('reason')}
                    options={leaveReasons}
                    placeholder="اختر نوع الإجازة"
                    error={errors.reason?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عدد الأيام
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-lg font-semibold text-gray-900">
                      {daysCount} يوم
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                تفاصيل الإجازة
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سبب الإجازة *
                  </label>
                  <Textarea
                    {...register('reason')}
                    placeholder="اكتب تفاصيل سبب الإجازة المرضية..."
                    rows={4}
                    error={errors.reason?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رابط الشهادة الطبية (اختياري)
                  </label>
                  <Input
                    {...register('medical_certificate_url')}
                    type="url"
                    placeholder="https://example.com/certificate.pdf"
                    error={errors.medical_certificate_url?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات الموارد البشرية (اختياري)
                  </label>
                  <Textarea
                    {...register('hr_notes')}
                    placeholder="اكتب أي ملاحظات إضافية..."
                    rows={3}
                    error={errors.hr_notes?.message}
                  />
                </div>
              </div>
            </div>

            {/* Days Count Alert */}
            {daysCount > 0 && (
              <div className={`p-4 rounded-lg ${
                daysCount > 30 ? 'bg-red-50 border border-red-200' :
                daysCount > 14 ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className={`h-5 w-5 ${
                    daysCount > 30 ? 'text-red-600' :
                    daysCount > 14 ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    daysCount > 30 ? 'text-red-800' :
                    daysCount > 14 ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {daysCount > 30 ? `إجازة طويلة (${daysCount} يوم) - تحتاج مراجعة خاصة` :
                     daysCount > 14 ? `إجازة متوسطة (${daysCount} يوم) - تحتاج متابعة` :
                     `إجازة قصيرة (${daysCount} يوم) - ضمن الحدود الطبيعية`}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                loading={isLoading}
              >
                <Save className="h-5 w-5 ml-2" />
                {isLoading ? 'جاري الحفظ...' : 'حفظ الإجازة المرضية'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/employees/${employee.id}/sick-leaves`)}
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                إلغاء
              </Button>
            </div>
          </form>

          {/* Form Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              ملاحظات مهمة:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• الإجازات المرضية تحتاج موافقة من الموارد البشرية</li>
              <li>• الإجازات الطويلة (أكثر من 30 يوم) تحتاج مراجعة خاصة</li>
              <li>• يفضل إرفاق شهادة طبية للإجازات الطويلة</li>
              <li>• يمكن تعديل الإجازة لاحقاً من صفحة الإجازات</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  )
}