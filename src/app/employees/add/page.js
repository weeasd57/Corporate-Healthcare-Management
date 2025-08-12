'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Users, 
  ArrowLeft, 
  Save, 
  UserPlus,
  Building2
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { db } from '@/lib/supabase'
import { validateEmail, validatePhone } from '@/lib/utils'

// Schema validation
const employeeSchema = z.object({
  first_name: z.string().min(2, 'الاسم الأول مطلوب (حرفين على الأقل)'),
  last_name: z.string().min(2, 'اسم العائلة مطلوب (حرفين على الأقل)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  employee_id: z.string().min(1, 'رقم الموظف مطلوب'),
  department: z.string().min(1, 'القسم مطلوب'),
  position: z.string().min(1, 'الوظيفة مطلوبة'),
  hire_date: z.string().min(1, 'تاريخ التوظيف مطلوب'),
  role: z.string().min(1, 'الدور مطلوب')
})

const departments = [
  { value: 'it', label: 'تقنية المعلومات' },
  { value: 'hr', label: 'الموارد البشرية' },
  { value: 'finance', label: 'المالية' },
  { value: 'marketing', label: 'التسويق' },
  { value: 'sales', label: 'المبيعات' },
  { value: 'operations', label: 'العمليات' },
  { value: 'legal', label: 'الشؤون القانونية' },
  { value: 'other', label: 'أخرى' }
]

const positions = [
  { value: 'manager', label: 'مدير' },
  { value: 'supervisor', label: 'مشرف' },
  { value: 'specialist', label: 'أخصائي' },
  { value: 'coordinator', label: 'منسق' },
  { value: 'assistant', label: 'مساعد' },
  { value: 'intern', label: 'متدرب' },
  { value: 'other', label: 'أخرى' }
]

const roles = [
  { value: 'employee', label: 'موظف' },
  { value: 'company_hr', label: 'موارد بشرية' },
  { value: 'company_manager', label: 'مدير' }
]

export default function AddEmployeePage() {
  const router = useRouter()
  const { userData, organization } = useAuth()
  const { addEmployee } = useData()
  const { addNotification } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'employee',
      hire_date: new Date().toISOString().split('T')[0]
    }
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
  }, [userData, router])

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      // Create employee user record
      const { data: employeeData, error: employeeError } = await addEmployee({
        organization_id: userData.organization_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        department: data.department,
        position: data.position,
        employee_id: data.employee_id,
        hire_date: data.hire_date,
        is_active: true
      })

      if (employeeError) throw employeeError

      // Create medical record for the employee
      const { error: medicalError } = await db.createMedicalRecord({
        employee_id: employeeData.id,
        health_status: 'healthy'
      })

      if (medicalError) throw medicalError

      addNotification({
        type: 'success',
        title: 'تم الإضافة',
        message: 'تم إضافة الموظف بنجاح'
      })

      // Success - redirect to employees list
      router.push('/employees')
      
    } catch (error) {
      console.error('Add employee error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: error.message || 'حدث خطأ أثناء إضافة الموظف'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedDepartment = watch('department')
  const selectedRole = watch('role')

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
                onClick={() => router.push('/dashboard/company')}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للوحة التحكم
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  إضافة موظف جديد
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              إضافة موظف جديد
            </h2>
            <p className="text-gray-600">
              قم بإدخال بيانات الموظف الجديد
            </p>
          </div>



          {/* Employee Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الشخصية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الأول *
                  </label>
                  <Input
                    {...register('first_name')}
                    placeholder="الاسم الأول"
                    error={errors.first_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العائلة *
                  </label>
                  <Input
                    {...register('last_name')}
                    placeholder="اسم العائلة"
                    error={errors.last_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="employee@company.com"
                    error={errors.email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="05xxxxxxxx"
                    error={errors.phone?.message}
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات التوظيف
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الموظف *
                  </label>
                  <Input
                    {...register('employee_id')}
                    placeholder="رقم الموظف"
                    error={errors.employee_id?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ التوظيف *
                  </label>
                  <Input
                    {...register('hire_date')}
                    type="date"
                    error={errors.hire_date?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    القسم *
                  </label>
                  <Select
                    {...register('department')}
                    options={departments}
                    placeholder="اختر القسم"
                    error={errors.department?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوظيفة *
                  </label>
                  <Select
                    {...register('position')}
                    options={positions}
                    placeholder="اختر الوظيفة"
                    error={errors.position?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور *
                  </label>
                  <Select
                    {...register('role')}
                    options={roles}
                    placeholder="اختر الدور"
                    error={errors.role?.message}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                loading={isLoading}
              >
                <Save className="h-5 w-5 ml-2" />
                {isLoading ? 'جاري الإضافة...' : 'إضافة الموظف'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/employees')}
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
              <li>• سيتم إنشاء سجل طبي تلقائياً للموظف الجديد</li>
              <li>• يمكن للموظف الوصول للنظام باستخدام بريده الإلكتروني</li>
              <li>• يمكن تعديل البيانات لاحقاً من صفحة إدارة الموظفين</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  )
}