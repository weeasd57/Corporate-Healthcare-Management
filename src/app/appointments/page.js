"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'

export default function AppointmentsIndexPage() {
  const router = useRouter()
  const { organization, loading } = useAuth()
  const { employees } = useData()
  const [employeeId, setEmployeeId] = useState('')

  useEffect(() => {
    if (loading) return
    if (organization?.type === 'hospital') {
      // Hospitals land on daily appointments
      router.replace('/appointments/daily')
    }
  }, [organization, loading, router])

  if (organization?.type === 'hospital') {
    return null
  }

  const handleGo = () => {
    if (!employeeId) return
    router.push(`/employees/${employeeId}/appointments`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Appointments</h1>
          <p className="text-sm text-gray-600 mb-6">Select an employee to view their appointments.</p>

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

            <Button onClick={handleGo} disabled={!employeeId}>Open</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}


