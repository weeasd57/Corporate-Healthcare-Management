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
  Plus,
  User,
  Building2,
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
const checkupSchema = z.object({
  checkup_type: z.string().min(1, 'نوع الفحص مطلوب'),
  scheduled_date: z.string().min(1, 'تاريخ الفحص مطلوب'),
  hospital_id: z.string().min(1, 'المستشفى مطلوب'),
  doctor_id: z.string().optional(),
  doctor_notes: z.string().optional(),
  recommendations: z.string().optional(),
  next_checkup_date: z.string().optional()
})

const checkupTypes = [
  { value: 'annual', label: 'فحص سنوي' },
  { value: 'pre_employment', label: 'فحص ما قبل التوظيف' },
  { value: 'periodic', label: 'فحص دوري' },
  { value: 'special', label: 'فحص خاص' },
  { value: 'emergency', label: 'فحص طوارئ' },
  { value: 'followup', label: 'فحص متابعة' }
]

const resultOptions = [
  { value: 'passed', label: 'ناجح' },
  { value: 'failed', label: 'فاشل' },
  { value: 'needs_followup', label: 'يحتاج متابعة' }
]

export default function AddCheckupPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, organization } = useAuth()
  const { employees, hospitals, doctors } = useData()
  const { addNotification } = useApp()
  
  const [employee, setEmployee] = useState(null)
  const [availableHospitals, setAvailableHospitals] = useState([])
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(checkupSchema)
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

      // Filter hospitals (only hospitals, not companies)
      const hospitalsList = hospitals.filter(hospital => hospital.type === 'hospital')
      setAvailableHospitals(hospitalsList)

      // Filter doctors (only users with doctor role)
      const doctorsList = doctors.filter(doctor => doctor.role === 'doctor')
      setAvailableDoctors(doctorsList)

      // Set default form values
      reset({
        checkup_type: 'annual',
        scheduled_date: '',
        hospital_id: '',
        doctor_id: '',
        doctor_notes: '',
        recommendations: '',
        next_checkup_date: ''
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
  }, [employees, hospitals, doctors, params.id, addNotification, router, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const checkupData = {
        employee_id: employee.id,
        hospital_id: data.hospital_id,
        doctor_id: data.doctor_id || null,
        checkup_type: data.checkup_type,
        scheduled_date: data.scheduled_date,
        status: 'scheduled',
        doctor_notes: data.doctor_notes || null,
        recommendations: data.recommendations || null,
        next_checkup_date: data.next_checkup_date || null
      }

      const { error } = await db.createCheckup(checkupData)
      
      if (error) throw error

      addNotification({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم إنشاء الفحص الطبي بنجاح'
      })

      // Redirect to checkups list
      router.push(`/employees/${employee.id}/checkups`)
      
    } catch (error) {
      console.error('Create checkup error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: error.message || 'حدث خطأ أثناء إنشاء الفحص الطبي'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCheckupType = watch('checkup_type')

  if (initialLoading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/employees/${employee.id}/checkups`)}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لفحوصات الموظف
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Plus className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  إضافة فحص طبي
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
              <Stethoscope className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              إضافة فحص طبي
            </h2>
            <p className="text-gray-600">
              قم بإنشاء فحص طبي جديد للموظف {employee.first_name} {employee.last_name}
            </p>
          </div>

          {/* Checkup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات الفحص الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الفحص *
                  </label>
                  <Select
                    {...register('checkup_type')}
                    options={checkupTypes}
                    placeholder="اختر نوع الفحص"
                    error={errors.checkup_type?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ ووقت الفحص *
                  </label>
                  <Input
                    {...register('scheduled_date')}
                    type="datetime-local"
                    error={errors.scheduled_date?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المستشفى *
                  </label>
                  <Select
                    {...register('hospital_id')}
                    options={availableHospitals.map(hospital => ({
                      value: hospital.id,
                      label: hospital.name
                    }))}
                    placeholder="اختر المستشفى"
                    error={errors.hospital_id?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الطبيب (اختياري)
                  </label>
                  <Select
                    {...register('doctor_id')}
                    options={[
                      { value: '', label: 'اختر الطبيب (اختياري)' },
                      ...availableDoctors.map(doctor => ({
                        value: doctor.id,
                        label: `${doctor.first_name} ${doctor.last_name}`
                      }))
                    ]}
                    placeholder="اختر الطبيب"
                    error={errors.doctor_id?.message}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الطبية
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات الطبيب (اختياري)
                  </label>
                  <Textarea
                    {...register('doctor_notes')}
                    placeholder="اكتب ملاحظات الطبيب..."
                    rows={4}
                    error={errors.doctor_notes?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التوصيات (اختياري)
                  </label>
                  <Textarea
                    {...register('recommendations')}
                    placeholder="اكتب التوصيات الطبية..."
                    rows={3}
                    error={errors.recommendations?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الفحص التالي (اختياري)
                  </label>
                  <Input
                    {...register('next_checkup_date')}
                    type="date"
                    error={errors.next_checkup_date?.message}
                  />
                </div>
              </div>
            </div>

            {/* Checkup Type Alert */}
            {selectedCheckupType && (
              <div className={`p-4 rounded-lg ${
                selectedCheckupType === 'emergency' ? 'bg-red-50 border border-red-200' :
                selectedCheckupType === 'special' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className={`h-5 w-5 ${
                    selectedCheckupType === 'emergency' ? 'text-red-600' :
                    selectedCheckupType === 'special' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedCheckupType === 'emergency' ? 'text-red-800' :
                    selectedCheckupType === 'special' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {selectedCheckupType === 'emergency' ? 'فحص طوارئ - يحتاج اهتمام فوري' :
                     selectedCheckupType === 'special' ? 'فحص خاص - يحتاج متابعة' :
                     'فحص روتيني - ضمن الجدول العادي'}
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
                {isLoading ? 'جاري الحفظ...' : 'حفظ الفحص الطبي'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/employees/${employee.id}/checkups`)}
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
              <li>• الفحوصات السنوية إلزامية لجميع الموظفين</li>
              <li>• الفحوصات الطارئة لها أولوية عالية</li>
              <li>• يمكن تحديد تاريخ الفحص التالي للمتابعة</li>
              <li>• سيتم إرسال إشعار للموظف بموعد الفحص</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  )
}