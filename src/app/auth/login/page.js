'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Stethoscope, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useApp } from '@/providers/AppProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { validateEmail } from '@/lib/utils'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userData, signIn } = useAuth()
  const { addNotification } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Schema validation
  const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(1, 'كلمة المرور مطلوبة')
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  // Redirect if already logged in
  useEffect(() => {
    if (userData?.user) {
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      router.push(redirectTo)
    }
  }, [userData, router, searchParams])

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const { email, password } = data
      const result = await signIn(email, password)
      
      if (result.error) {
        if (result.error.message.includes('Invalid credentials')) {
          setError('email', { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
        } else {
          addNotification({
            type: 'error',
            title: 'خطأ في تسجيل الدخول',
            message: result.error.message
          })
        }
        return
      }

      addNotification({
        type: 'success',
        title: 'تم تسجيل الدخول بنجاح',
        message: 'مرحباً بك في النظام'
      })

      // Redirect based on user role/type
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      router.push(redirectTo)
      
    } catch (error) {
      console.error('Login error:', error)
      addNotification({
        type: 'error',
        title: 'خطأ في الاتصال',
        message: 'يرجى المحاولة مرة أخرى'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const redirectToRegister = (type) => {
    router.push(`/auth/register/${type}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center space-x-2 space-x-reverse">
            <Building2 className="h-12 w-12 text-green-600" />
            <Stethoscope className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            نظام إدارة الصحة للشركات والمستشفيات
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="البريد الإلكتروني"
                type="email"
                autoComplete="email"
                required
                error={errors.email?.message}
                {...register('email')}
                placeholder="example@company.com"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  error={errors.password?.message}
                  {...register('password')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute left-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                  تذكرني
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Registration Options */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟ قم بالتسجيل كـ:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => redirectToRegister('company')}
              className="w-full justify-center"
            >
              <Building2 className="ml-2 h-4 w-4 text-green-600" />
              شركة
            </Button>

            <Button
              variant="outline"
              onClick={() => redirectToRegister('hospital')}
              className="w-full justify-center"
            >
              <Stethoscope className="ml-2 h-4 w-4 text-blue-600" />
              مستشفى
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}