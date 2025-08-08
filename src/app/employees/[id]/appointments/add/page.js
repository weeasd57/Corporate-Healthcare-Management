'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Calendar, 
  ArrowLeft, 
  Save, 
  Plus,
  User,
  Building2,
  Clock
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
const appointmentSchema = z.object({
  appointment_type: z.string().min(1, 'نوع الموعد مطلوب'),
  appointment_date: z.string().min(1, 'تاريخ الموعد مطلوب'),
  duration_minutes: z.number().min(15, 'المدة يجب أن تكون 15 دقيقة على الأقل').max(480, 'المدة يجب أن تكون 8 ساعات كحد أقصى'),
  hospital_id: z.string().min(1, 'المستشفى مطلوب'),
  doctor_id: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional()
})

const appointmentTypes = [
  { value: 'checkup', label: 'فحص طبي' },
  { value: 'consultation', label: 'استشارة' },
  { value: 'followup', label: 'متابعة' },
  { value: 'emergency', label: 'طوارئ' },
  { value: 'routine', label: 'فحص روتيني' }
]

const durationOptions = [
  { value: 15, label: '15 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: 'ساعة واحدة' },
  { value: 90, label: 'ساعة ونصف' },
  { value: 120, label: 'ساعتين' }
]

export default function AddAppointmentPage() {
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
    resolver: zodResolver(appointmentSchema)
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
        appointment_type: 'checkup',
        appointment_date: '',
        duration_minutes: 30,
        hospital_id: '',
        doctor_id: '',
        symptoms: '',
        notes: ''
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
      const appointmentData = {
        employee_id: employee.id,
        hospital_id: data.hospital_id,
        doctor_id: data.doctor_id || null,
        appointment_date: data.appointment_date,
        duration_minutes: data.duration_minutes,
        appointment_type: data.appointment_type,
        status: 'scheduled',
        symptoms: data.symptoms || null,
        notes: data.notes || null,
        created_by: userData.id
      }

      const { error } = await db.createAppointment(appointmentData)
      
      if (error) throw error

      addNotification({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم إنشاء الموعد بنجاح'
      })

      // Redirect to appointments list
      router.push(`/employees/${employee.id}/appointments`)
      
    } catch (error) {
      console.error('Create appointment error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: error.message || 'حدث خطأ أثناء إنشاء الموعد'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedHospital = watch('hospital_id')

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
                onClick={() => router.push(`/employees/${employee.id}/appointments`)}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لمواعيد الموظف
              </Button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Plus className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  إضافة موعد جديد
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
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              إضافة موعد جديد
            </h2>
            <p className="text-gray-600">
              قم بإنشاء موعد جديد للموظف {employee.first_name} {employee.last_name}
            </p>
          </div>

          {/* Appointment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات الموعد الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الموعد *
                  </label>
                  <Select
                    {...register('appointment_type')}
                    options={appointmentTypes}
                    placeholder="اختر نوع الموعد"
                    error={errors.appointment_type?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ ووقت الموعد *
                  </label>
                  <Input
                    {...register('appointment_date')}
                    type="datetime-local"
                    error={errors.appointment_date?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الموعد *
                  </label>
                  <Select
                    {...register('duration_minutes', { valueAsNumber: true })}
                    options={durationOptions}
                    placeholder="اختر المدة"
                    error={errors.duration_minutes?.message}
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
              </div>
            </div>

            {/* Doctor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات الطبيب
              </h3>
              
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

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الطبية
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأعراض (اختياري)
                  </label>
                  <Textarea
                    {...register('symptoms')}
                    placeholder="اكتب الأعراض إن وجدت..."
                    rows={3}
                    error={errors.symptoms?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <Textarea
                    {...register('notes')}
                    placeholder="اكتب أي ملاحظات إضافية..."
                    rows={3}
                    error={errors.notes?.message}
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
                {isLoading ? 'جاري الحفظ...' : 'حفظ الموعد'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/employees/${employee.id}/appointments`)}
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
              <li>• سيتم إرسال إشعار للموظف بالموعد الجديد</li>
              <li>• يمكن تعديل الموعد لاحقاً من صفحة المواعيد</li>
              <li>• المواعيد الطارئة لها أولوية عالية</li>
              <li>• تأكد من توفر الطبيب والمستشفى في التاريخ المحدد</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  )
}