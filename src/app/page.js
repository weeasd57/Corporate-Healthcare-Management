'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Stethoscope, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    // For now, redirect to login page
    router.push('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Building2 className="h-12 w-12 text-green-600" />
              <Stethoscope className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            نظام إدارة الصحة للشركات والمستشفيات
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة متكاملة لإدارة الصحة والمواعيد الطبية بين الشركات والمستشفيات
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/register/company')}
            >
              تسجيل شركة جديدة
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/register/hospital')}
            >
              تسجيل مستشفى جديد
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
          </div>
          
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/login')}
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
