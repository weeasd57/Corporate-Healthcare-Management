'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { validateEmail, validatePhone } from '@/lib/utils'

// Schema validation
const hospitalSchema = z.object({
  // Organization data
  name: z.string().min(2, 'اسم المستشفى مطلوب (حرفين على الأقل)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  address: z.string().min(10, 'العنوان مطلوب (10 أحرف على الأقل)'),
  license_number: z.string().min(1, 'رقم الترخيص مطلوب'),
  contact_person: z.string().min(2, 'اسم الشخص المسؤول مطلوب'),
  
  // Admin user data
  admin_first_name: z.string().min(2, 'الاسم الأول مطلوب'),
  admin_last_name: z.string().min(2, 'اسم العائلة مطلوب'),
  admin_email: z.string().email('البريد الإلكتروني غير صحيح'),
  admin_phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirm_password"]
})

export default function HospitalRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(hospitalSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          type: 'hospital',
          email: data.email,
          phone: data.phone,
          address: data.address,
          license_number: data.license_number,
          contact_person: data.contact_person,
          status: 'active'
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.admin_email,
        password: data.password,
        options: {
          data: {
            first_name: data.admin_first_name,
            last_name: data.admin_last_name,
            organization_id: orgData.id,
            role: 'hospital_admin'
          }
        }
      })

      if (authError) throw authError

      // 3. Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          organization_id: orgData.id,
          email: data.admin_email,
          first_name: data.admin_first_name,
          last_name: data.admin_last_name,
          phone: data.admin_phone,
          role: 'hospital_admin',
          is_active: true
        })

      if (userError) throw userError

      // Success - redirect to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'حدث خطأ أثناء التسجيل')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Stethoscope className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              تسجيل مستشفى جديد
            </h1>
            <p className="text-gray-600">
              قم بإنشاء حساب لمستشفاك للوصول إلى نظام إدارة الصحة
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hospital Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات المستشفى
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المستشفى *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="أدخل اسم المستشفى"
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="info@hospital.com"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الترخيص *
                  </label>
                  <Input
                    {...register('license_number')}
                    placeholder="رقم الترخيص الطبي"
                    error={errors.license_number?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشخص المسؤول *
                  </label>
                  <Input
                    {...register('contact_person')}
                    placeholder="اسم الشخص المسؤول"
                    error={errors.contact_person?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان المستشفى *
                </label>
                <Input
                  {...register('address')}
                  placeholder="أدخل العنوان الكامل للمستشفى"
                  error={errors.address?.message}
                />
              </div>
            </div>

            {/* Admin User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات المدير المسؤول
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الأول *
                  </label>
                  <Input
                    {...register('admin_first_name')}
                    placeholder="الاسم الأول"
                    error={errors.admin_first_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العائلة *
                  </label>
                  <Input
                    {...register('admin_last_name')}
                    placeholder="اسم العائلة"
                    error={errors.admin_last_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    {...register('admin_email')}
                    type="email"
                    placeholder="admin@hospital.com"
                    error={errors.admin_email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <Input
                    {...register('admin_phone')}
                    placeholder="05xxxxxxxx"
                    error={errors.admin_phone?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة المرور"
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirm_password')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="تأكيد كلمة المرور"
                      error={errors.confirm_password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                loading={isLoading}
              >
                {isLoading ? 'جاري التسجيل...' : 'تسجيل المستشفى'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/login')}
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                العودة لتسجيل الدخول
              </Button>
            </div>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              بالضغط على "تسجيل المستشفى" فإنك توافق على{' '}
              <a href="#" className="text-blue-600 hover:underline">
                شروط الاستخدام
              </a>{' '}
              و{' '}
              <a href="#" className="text-blue-600 hover:underline">
                سياسة الخصوصية
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}