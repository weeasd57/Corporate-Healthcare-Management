'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'

export default function PatientsPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const { employees } = useData()

  const patients = useMemo(() => {
    // المرضى هم الموظفون في المؤسسة (نفس جدول users بدور employee)
    return employees.filter(emp => emp.role === 'employee')
  }, [employees])

  const columns = [
    { key: 'name', label: 'Name', render: (p) => (
      <div>
        <div className="font-medium">{p.first_name} {p.last_name}</div>
        <div className="text-xs text-gray-500">{p.email}</div>
      </div>
    )},
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'actions', label: 'Actions', render: (p) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => router.push(`/employees/${p.id}/medical`)}>Medical</Button>
        <Button size="sm" variant="outline" onClick={() => router.push(`/employees/${p.id}/appointments`)}>Appointments</Button>
      </div>
    )}
  ]

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Please sign in.</div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <Button onClick={() => router.push('/employees/add')}>Add Patient</Button>
      </div>
      <Card className="p-4">
        {patients.length > 0 ? (
          <Table data={patients} columns={columns} keyField="id" />
        ) : (
          <div className="text-center py-16 text-gray-500">No patients found</div>
        )}
      </Card>
    </div>
  )
}