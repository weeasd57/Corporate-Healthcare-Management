'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { db } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function NewPrescriptionPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const { employees } = useData()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    employee_id: '',
    doctor_id: userData?.id || '',
    notes: ''
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await db.createPrescription({
        employee_id: form.employee_id,
        doctor_id: form.doctor_id || null,
        notes: form.notes
      })
      if (error) throw error
      router.push(`/employees/${form.employee_id}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!userData) return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Please sign in.</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">New Prescription</h1>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Employee</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            >
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Notes</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Prescription notes"
            />
          </div>

          <Button type="submit" loading={isLoading}>Save</Button>
        </form>
      </Card>
    </div>
  )
}