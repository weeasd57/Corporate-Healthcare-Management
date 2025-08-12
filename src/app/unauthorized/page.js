'use client'

import { useRouter } from 'next/navigation'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Sorry, you do not have permission to access this page.
            Please contact your administrator if you believe this is a mistake.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-5 w-5 ml-2" />
              Go Back
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="h-5 w-5 ml-2" />
              Back to Home
            </Button>
          </div>

          {/* Help */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Need help?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              If you are having trouble accessing the system, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}