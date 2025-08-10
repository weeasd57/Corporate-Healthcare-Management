"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { userData, organization, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!userData) {
      router.replace('/auth/login?redirect=/dashboard')
      return
    }

    if (organization?.type === 'company') {
      router.replace('/dashboard/company')
      return
    }

    if (organization?.type === 'hospital') {
      router.replace('/dashboard/hospital')
      return
    }

    router.replace('/unauthorized')
  }, [loading, userData, organization, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}


