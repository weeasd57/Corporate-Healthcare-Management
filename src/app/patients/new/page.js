'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
})

export default function NewPatientPage() {
  const router = useRouter()
  const { userData, organization } = useAuth()
  const { addEmployee } = useData()
  const { addNotification } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!userData) return
    // Only company users can add patients (patients are company employees)
    if (!userData.role?.startsWith('company_')) {
      router.push('/unauthorized')
    }
  }, [userData, router])

  const onSubmit = async (values) => {
    if (!userData?.organization_id) return
    setIsLoading(true)
    try {
      const payload = {
        first_name: values.first_name.trim(),
        last_name: (values.last_name || '').trim(),
        email: values.email.trim().toLowerCase(),
        phone: (values.phone || '').trim() || null,
        address: (values.address || '').trim() || null,
        role: 'employee',
        organization_id: userData.organization_id,
        is_active: true
      }

      const { data, error } = await addEmployee(payload)
      if (error) throw error

      addNotification({
        type: 'success',
        title: 'Saved',
        message: 'Patient has been created successfully'
      })
      reset()
      router.push('/patients')
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to create patient'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Patient</h1>
            <p className="text-gray-600">Add a new patient to your company.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                <Input {...register('first_name')} error={errors.first_name?.message} placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <Input {...register('last_name')} error={errors.last_name?.message} placeholder="Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input type="email" {...register('email')} error={errors.email?.message} placeholder="john.doe@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input {...register('phone')} error={errors.phone?.message} placeholder="+1 555 123 4567" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Textarea rows={3} {...register('address')} error={errors.address?.message} placeholder="Street, City, Country" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Textarea rows={3} {...register('notes')} error={errors.notes?.message} placeholder="Internal notes (optional)" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={isLoading} className="flex-1">Save Patient</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/patients')}>Cancel</Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}