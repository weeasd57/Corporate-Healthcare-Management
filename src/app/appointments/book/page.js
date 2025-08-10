"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'

export default function BookAppointmentEntryPage() {
  const router = useRouter()
  const { organization } = useAuth()
  const { employees } = useData()
  const [employeeId, setEmployeeId] = useState('')

  const handleNext = () => {
    if (!employeeId) return
    router.push(`/employees/${employeeId}/appointments/add`)
  }

  if (organization?.type === 'hospital') {
    // Hospitals should use /appointments/daily
    router.replace('/appointments/daily')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Book Appointment</h1>
          <p className="text-sm text-gray-600 mb-6">Choose an employee to create a new appointment.</p>

          <div className="grid grid-cols-1 gap-4">
            <Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={[
                { value: '', label: 'Select employee' },
                ...employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email
                }))
              ]}
              placeholder="Select employee"
            />

            <Button onClick={handleNext} disabled={!employeeId}>Continue</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}


