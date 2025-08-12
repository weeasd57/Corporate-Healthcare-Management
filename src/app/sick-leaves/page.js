'use client'

import { useMemo, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import { useApp } from '@/providers/AppProvider'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

export default function SickLeavesPage() {
  const router = useRouter()
  const { userData, organization } = useAuth()
  const { employees = [], sickLeaves = [], refreshData } = useData()
  const { addNotification } = useApp()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [filtered, setFiltered] = useState([])
  const employeesById = useMemo(() => Object.fromEntries(employees.map(e => [e.id, e])), [employees])

  const filterData = useCallback(() => {
    let rows = [...(sickLeaves || [])]
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => {
        const emp = employeesById[r.employee_id]
        return (
          emp?.first_name?.toLowerCase().includes(q) ||
          emp?.last_name?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q)
        )
      })
    }
    if (status) rows = rows.filter(r => r.status === status)
    setFiltered(rows)
  }, [sickLeaves, search, status, employeesById])

  useEffect(() => { filterData() }, [filterData])

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => {
        const e = employeesById[row.employee_id]
        return e ? `${e.first_name} ${e.last_name}` : '—'
      }
    },
    {
      key: 'period',
      label: 'Period',
      render: (row) => {
        const from = new Date(row.start_date).toLocaleDateString()
        const to = new Date(row.end_date).toLocaleDateString()
        return `${from} → ${to}`
      }
    },
    { key: 'status', label: 'Status' },
    { key: 'reason', label: 'Reason' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sick Leaves</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>Refresh</Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search by employee or reason..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
            <Button onClick={filterData}>Apply Filters</Button>
          </div>
        </Card>

        <Card className="p-6">
          <Table data={filtered} columns={columns} keyField="id" />
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No sick leaves found.</p>
          )}
        </Card>
      </main>
    </div>
  )
}