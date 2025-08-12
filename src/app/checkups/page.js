'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { db } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'

export default function CheckupsPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const { employees, checkups, refreshData } = useData()

  const employeesById = useMemo(() => Object.fromEntries(employees.map(e => [e.id, e])), [employees])

  const columns = [
    { key: 'employee', label: 'Employee', render: (c) => {
      const emp = employeesById[c.employee_id]
      return emp ? `${emp.first_name} ${emp.last_name}` : '—'
    }},
    { key: 'checkup_type', label: 'Type' },
    { key: 'scheduled_date', label: 'Scheduled' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', render: (c) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => router.push(`/employees/${c.employee_id}/checkups`)}>View</Button>
      </div>
    )}
  ]

  if (!userData) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Please sign in.</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Checkups</h1>
        <Button onClick={refreshData} variant="outline">Refresh</Button>
      </div>
      <Card className="p-4">
        {checkups?.length ? (
          <Table data={checkups} columns={columns} keyField="id" />
        ) : (
          <div className="text-center py-16 text-gray-500">No checkups</div>
        )}
      </Card>
    </div>
  )
}