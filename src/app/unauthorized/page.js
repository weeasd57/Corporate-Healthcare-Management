'use client'

import { useRouter } from 'next/navigation'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            غير مصرح بالوصول
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. 
            يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-5 w-5 ml-2" />
              العودة للصفحة السابقة
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="h-5 w-5 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </div>

          {/* Help */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              هل تحتاج مساعدة؟
            </h3>
            <p className="text-sm text-blue-800">
              إذا كنت تواجه مشكلة في الوصول، يرجى التواصل مع فريق الدعم الفني.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}