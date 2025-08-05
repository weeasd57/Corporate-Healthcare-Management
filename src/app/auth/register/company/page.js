'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { Building2, ArrowRight } from 'lucide-react'

export default function CompanyRegisterPage() {
  const [formData, setFormData] = useState({
    // Organization data
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    
    // Admin user data
    first_name: '',
    last_name: '',
    admin_email: '',
    password: '',
    confirm_password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          type: 'company',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contact_person: formData.contact_person,
          status: 'active'
        })
        .select()
        .single()

      if (orgError) {
        setError('خطأ في إنشاء الشركة: ' + orgError.message)
        return
      }

      // 2. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.admin_email,
        password: formData.password,
      })

      if (authError) {
        setError('خطأ في إنشاء الحساب: ' + authError.message)
        return
      }

      // 3. Create user record
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            organization_id: orgData.id,
            email: formData.admin_email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'company_admin',
            is_active: true
          })

        if (userError) {
          setError('خطأ في إنشاء المستخدم: ' + userError.message)
          return
        }
      }

      // Success - redirect to login
      router.push('/auth/login?message=تم إنشاء الحساب بنجاح')
      
    } catch (error) {
      setError('حدث خطأ أثناء التسجيل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل شركة جديدة
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            قم بإنشاء حساب شركة جديد للوصول إلى نظام إدارة الصحة
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Organization Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الشركة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="اسم الشركة"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="أدخل اسم الشركة"
                />
                
                <Input
                  label="البريد الإلكتروني للشركة"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="info@company.com"
                />
                
                <Input
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="+20123456789"
                />
                
                <Input
                  label="الشخص المسؤول"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  required
                  placeholder="اسم الشخص المسؤول"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  placeholder="عنوان الشركة"
                />
              </div>
            </div>

            {/* Admin User Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المدير</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="الاسم الأول"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                  placeholder="الاسم الأول"
                />
                
                <Input
                  label="الاسم الأخير"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                  placeholder="الاسم الأخير"
                />
                
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  required
                  placeholder="admin@company.com"
                />
                
                <Input
                  label="كلمة المرور"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="كلمة المرور"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="تأكيد كلمة المرور"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  required
                  placeholder="تأكيد كلمة المرور"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/auth/login')}
              >
                العودة لتسجيل الدخول
              </Button>
              
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                إنشاء الحساب
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}