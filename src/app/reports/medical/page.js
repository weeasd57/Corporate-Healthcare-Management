'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useData } from '@/providers/DataProvider'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'

export default function MedicalReportsPage() {
  const { userData, organization } = useAuth()
  const { employees = [], appointments = [], checkups = [], sickLeaves = [] } = useData()

  const [employeeId, setEmployeeId] = useState('')
  const [search, setSearch] = useState('')

  const employeesOptions = useMemo(
    () => [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))],
    [employees]
  )

  const normalized = useMemo(() => {
    const rows = []
    const add = (type, row) => rows.push({ type, ...row })
    ;(appointments || []).forEach(a => add('appointment', a))
    ;(checkups || []).forEach(c => add('checkup', c))
    ;(sickLeaves || []).forEach(s => add('sick_leave', s))
    return rows
  }, [appointments, checkups, sickLeaves])

  const filtered = useMemo(() => {
    let rows = [...normalized]
    if (employeeId) rows = rows.filter(r => r.employee_id === employeeId)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.type.includes(q) ||
        r.appointment_type?.toLowerCase().includes(q) ||
        r.checkup_type?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [normalized, employeeId, search])

  const columns = [
    { key: 'type', label: 'Type', render: (r) => r.type.replace('_', ' ') },
    { key: 'employee_id', label: 'Employee', render: (r) => employees.find(e => e.id === r.employee_id)?.first_name + ' ' + (employees.find(e => e.id === r.employee_id)?.last_name || '') },
    { key: 'date', label: 'Date', render: (r) => new Date(r.appointment_date || r.scheduled_date || r.start_date).toLocaleString() },
    { key: 'details', label: 'Details', render: (r) => r.appointment_type || r.checkup_type || r.reason || '—' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select options={employeesOptions} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            <Input placeholder="Search by type or details..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <Table data={filtered} columns={columns} keyField="id" />
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No medical records found.</p>
          )}
        </Card>
      </main>
    </div>
  )
}