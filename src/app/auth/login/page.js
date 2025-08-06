'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Stethoscope, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { auth, db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { validateEmail } from '@/lib/utils'

// Schema validation
const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة')
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  useEffect(() => {
    // Check for success message from registration
    const successMessage = searchParams.get('message')
    if (successMessage) {
      setMessage(successMessage)
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      const { user } = await auth.getCurrentUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [searchParams, router])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      // Sign in user
      const { data: authData, error: authError } = await auth.signIn(data.email, data.password)

      if (authError) throw authError

      if (authData.user) {
        // Get user details from database
        const { data: userData, error: userError } = await db.getUserByAuthId(authData.user.id)

        if (userError) throw userError

        if (userData) {
          // Redirect based on user role
          if (userData.role.startsWith('company_')) {
            router.push('/dashboard/company')
          } else if (userData.role.startsWith('hospital_')) {
            router.push('/dashboard/hospital')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/dashboard')
        }
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Building2 className="h-8 w-8 text-green-600" />
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-gray-600">
              أدخل بياناتك للوصول إلى نظام إدارة الصحة
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
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

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
          </form>

          {/* Registration Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                ليس لديك حساب؟ سجل كـ:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push('/auth/register/company')}
                >
                  <Building2 className="h-4 w-4 ml-2" />
                  شركة
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push('/auth/register/hospital')}
                >
                  <Stethoscope className="h-4 w-4 ml-2" />
                  مستشفى
                </Button>
              </div>
            </div>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement forgot password
                  alert('سيتم إضافة هذه الميزة قريباً')
                }}
              >
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}