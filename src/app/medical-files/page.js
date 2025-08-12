'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { db } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'

export default function MedicalFilesPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const { employees } = useData()

  const rows = useMemo(() => employees.map(e => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    department: e.department,
    position: e.position
  })), [employees])

  const columns = [
    { key: 'name', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' }
  ]

  if (!userData) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Please sign in.</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Medical Files</h1>
      <Card className="p-4">
        <Table data={rows} columns={columns} keyField="id" />
      </Card>
    </div>
  )
}