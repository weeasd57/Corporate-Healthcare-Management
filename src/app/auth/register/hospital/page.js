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
  name: z.string().min(2, 'Hospital name is required (at least 2 characters)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(10, 'Address is required (at least 10 characters)'),
  license_number: z.string().min(1, 'License number is required'),
  contact_person: z.string().min(2, 'Contact person name is required'),
  
  // Admin user data
  admin_first_name: z.string().min(2, 'First name is required'),
  admin_last_name: z.string().min(2, 'Last name is required'),
  admin_email: z.string().email('Invalid email address'),
  admin_phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
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
      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.admin_email)
        .single()

      if (existingUser) {
        setError('A user with this email already exists. Please sign in instead.')
        return
      }

      // 2. Check if organization already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingOrg) {
        setError('A hospital with this email already exists.')
        return
      }

      // 3. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          type: 'hospital',
          email: data.email,
          phone: data.phone,
          address: data.address,
          license_number: data.license_number,
          contact_person: `${data.admin_first_name} ${data.admin_last_name}`,
          status: 'active'
        })
        .select()
        .single()

      if (orgError) {
        console.error('Organization creation error:', orgError)
        setError('Failed to create hospital. Please try again.')
        return
      }

      // 4. Create auth user
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

      if (authError) {
        console.error('Auth creation error:', authError)
        
        // Handle specific auth errors
        if (authError.message.includes('User already registered')) {
          setError('A user with this email already exists. Please sign in instead.')
        } else if (authError.message.includes('Password')) {
          setError('Password must be at least 6 characters long.')
        } else if (authError.message.includes('Email')) {
          setError('Please enter a valid email address.')
        } else {
          setError('Failed to create user account. Please try again.')
        }
        return
      }

      // 5. Create user record
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

      if (userError) {
        console.error('User creation error:', userError)
        setError('Failed to create user profile. Please contact support.')
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Stethoscope className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Register a new Hospital
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a hospital account to access the health management system
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                Hospital Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Hospital name *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Enter hospital name"
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="info@hospital.com"
                    error={errors.email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phone number *
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="05xxxxxxxx"
                    error={errors.phone?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    License number *
                  </label>
                  <Input
                    {...register('license_number')}
                    placeholder="Medical license number"
                    error={errors.license_number?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Contact person *
                  </label>
                  <Input
                    {...register('contact_person')}
                    placeholder="Responsible person name"
                    error={errors.contact_person?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Hospital address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="Enter full hospital address"
                  error={errors.address?.message}
                />
              </div>
            </div>

            {/* Admin User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                Admin Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    First name *
                  </label>
                  <Input
                    {...register('admin_first_name')}
                    placeholder="First name"
                    error={errors.admin_first_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Last name *
                  </label>
                  <Input
                    {...register('admin_last_name')}
                    placeholder="Last name"
                    error={errors.admin_last_name?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email *
                  </label>
                  <Input
                    {...register('admin_email')}
                    type="email"
                    placeholder="admin@hospital.com"
                    error={errors.admin_email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phone number *
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Confirm password *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirm_password')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      error={errors.confirm_password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {isLoading ? 'Registering...' : 'Register Hospital'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/login')}
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                Back to Sign in
              </Button>
            </div>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              By clicking "Register Hospital" you agree to the{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}