'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle
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
const medicalRecordSchema = z.object({
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  emergency_contact_name: z.string().min(2, 'اسم جهة الاتصال في الطوارئ مطلوب'),
  emergency_contact_phone: z.string().min(10, 'رقم هاتف الطوارئ غير صحيح'),
  health_status: z.string().min(1, 'الحالة الصحية مطلوبة'),
  last_checkup_date: z.string().optional(),
  notes: z.string().optional()
})

const bloodTypes = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

const healthStatuses = [
  { value: 'healthy', label: 'صحي' },
  { value: 'needs_attention', label: 'يحتاج انتباه' },
  { value: 'critical', label: 'حرج' }
]

export default function EditMedicalRecordPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(medicalRecordSchema)
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

      // Load medical record
      const { data: medicalData } = await db.getMedicalRecord(foundEmployee.id)
      setMedicalRecord(medicalData)

      // Set form values
      reset({
        blood_type: medicalData?.blood_type || '',
        allergies: medicalData?.allergies || '',
        chronic_conditions: medicalData?.chronic_conditions || '',
        emergency_contact_name: medicalData?.emergency_contact_name || '',
        emergency_contact_phone: medicalData?.emergency_contact_phone || '',
        health_status: medicalData?.health_status || 'healthy',
        last_checkup_date: medicalData?.last_checkup_date || '',
        notes: medicalData?.notes || ''
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

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      let result
      
      if (medicalRecord) {
        // Update existing record
        const { data: updatedRecord, error } = await db.updateMedicalRecord(medicalRecord.id, data)
        if (error) throw error
        result = updatedRecord
      } else {
        // Create new record
        const { data: newRecord, error } = await db.createMedicalRecord({
          employee_id: employee.id,
          ...data
        })
        if (error) throw error
        result = newRecord
      }

      addNotification({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم حفظ السجل الطبي بنجاح'
      })

      // Redirect to medical record page
      router.push(`/employees/${employee.id}/medical`)
      
    } catch (error) {
      console.error('Save medical record error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: error.message || 'حدث خطأ أثناء حفظ السجل الطبي'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedHealthStatus = watch('health_status')

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
                onClick={() => router.push(`/employees/${employee.id}/medical`)}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للسجل الطبي
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Edit className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {medicalRecord ? 'تعديل السجل الطبي' : 'إنشاء سجل طبي جديد'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Stethoscope className="h-5 w-5 text-green-600" />
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
              <Stethoscope className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {medicalRecord ? 'تعديل السجل الطبي' : 'إنشاء سجل طبي جديد'}
            </h2>
            <p className="text-gray-600">
              {medicalRecord ? 'قم بتعديل السجل الطبي للموظف' : 'قم بإنشاء سجل طبي جديد للموظف'} {employee.first_name} {employee.last_name}
            </p>
          </div>

          {/* Medical Record Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الطبية الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    فصيلة الدم
                  </label>
                  <Select
                    {...register('blood_type')}
                    options={bloodTypes}
                    placeholder="اختر فصيلة الدم"
                    error={errors.blood_type?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة الصحية *
                  </label>
                  <Select
                    {...register('health_status')}
                    options={healthStatuses}
                    placeholder="اختر الحالة الصحية"
                    error={errors.health_status?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    آخر فحص طبي
                  </label>
                  <Input
                    {...register('last_checkup_date')}
                    type="date"
                    error={errors.last_checkup_date?.message}
                  />
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                الحالات الطبية
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحساسية
                  </label>
                  <Textarea
                    {...register('allergies')}
                    placeholder="اكتب الحساسيات إن وجدت..."
                    rows={3}
                    error={errors.allergies?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأمراض المزمنة
                  </label>
                  <Textarea
                    {...register('chronic_conditions')}
                    placeholder="اكتب الأمراض المزمنة إن وجدت..."
                    rows={3}
                    error={errors.chronic_conditions?.message}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                جهة الاتصال في الطوارئ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم *
                  </label>
                  <Input
                    {...register('emergency_contact_name')}
                    placeholder="اسم جهة الاتصال"
                    error={errors.emergency_contact_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <Input
                    {...register('emergency_contact_phone')}
                    placeholder="05xxxxxxxx"
                    error={errors.emergency_contact_phone?.message}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                ملاحظات طبية
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات إضافية
                </label>
                <Textarea
                  {...register('notes')}
                  placeholder="اكتب أي ملاحظات طبية إضافية..."
                  rows={4}
                  error={errors.notes?.message}
                />
              </div>
            </div>

            {/* Health Status Alert */}
            {selectedHealthStatus && (
              <div className={`p-4 rounded-lg ${
                selectedHealthStatus === 'critical' ? 'bg-red-50 border border-red-200' :
                selectedHealthStatus === 'needs_attention' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {selectedHealthStatus === 'critical' ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : selectedHealthStatus === 'needs_attention' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    selectedHealthStatus === 'critical' ? 'text-red-800' :
                    selectedHealthStatus === 'needs_attention' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {selectedHealthStatus === 'critical' ? 'الحالة الصحية حرجة - تحتاج مراقبة خاصة' :
                     selectedHealthStatus === 'needs_attention' ? 'الحالة الصحية تحتاج انتباه' :
                     'الحالة الصحية جيدة'}
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
                {isLoading ? 'جاري الحفظ...' : 'حفظ السجل الطبي'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/employees/${employee.id}/medical`)}
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
              <li>• جميع المعلومات الطبية محفوظة بسرية تامة</li>
              <li>• يتم استخدام هذه المعلومات في حالات الطوارئ فقط</li>
              <li>• يمكن تحديث السجل الطبي في أي وقت</li>
              <li>• الحالة الصحية الحرجة تتطلب مراقبة خاصة</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  )
}