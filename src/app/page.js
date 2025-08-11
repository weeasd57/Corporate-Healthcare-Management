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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Building2 className="h-12 w-12 text-green-600" />
              <Stethoscope className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Health Management System for Companies and Hospitals
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A unified platform to manage health records and medical appointments between companies and hospitals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/register/company')}
            >
              Register a Company
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/register/hospital')}
            >
              Register a Hospital
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
          </div>
          
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/login')}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
