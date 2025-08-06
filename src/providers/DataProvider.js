'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { userData, organization } = useAuth()
  const [employees, setEmployees] = useState([])
  const [appointments, setAppointments] = useState([])
  const [sickLeaves, setSickLeaves] = useState([])
  const [checkups, setCheckups] = useState([])
  const [contracts, setContracts] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(false)

  // Load data when user or organization changes
  useEffect(() => {
    if (userData && organization) {
      loadData()
    }
  }, [userData, organization, loadData])

  const loadData = useCallback(async () => {
    if (!userData?.organization_id) return

    setLoading(true)
    try {
      // Load employees
      const { data: employeesData } = await db.getUsersByOrganization(userData.organization_id)
      setEmployees(employeesData || [])

      // Load appointments
      const { data: appointmentsData } = await db.getAppointments({
        employeeId: userData.organization_id
      })
      setAppointments(appointmentsData || [])

      // Load sick leaves
      const { data: sickLeavesData } = await db.getSickLeaves({
        employeeId: userData.organization_id
      })
      setSickLeaves(sickLeavesData || [])

      // Load checkups
      const { data: checkupsData } = await db.getCheckups({
        employeeId: userData.organization_id
      })
      setCheckups(checkupsData || [])

      // Load contracts
      const { data: contractsData } = await db.getContracts({
        companyId: userData.organization_id
      })
      setContracts(contractsData || [])

    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }, [userData?.organization_id])

  const refreshData = () => {
    loadData()
  }

  const addEmployee = async (employeeData) => {
    try {
      const { data, error } = await db.createUser(employeeData)
      if (error) throw error
      
      setEmployees(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateEmployee = async (id, updates) => {
    try {
      const { data, error } = await db.updateUser(id, updates)
      if (error) throw error
      
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, ...updates } : emp
      ))
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const addAppointment = async (appointmentData) => {
    try {
      const { data, error } = await db.createAppointment(appointmentData)
      if (error) throw error
      
      setAppointments(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const addSickLeave = async (sickLeaveData) => {
    try {
      const { data, error } = await db.createSickLeave(sickLeaveData)
      if (error) throw error
      
      setSickLeaves(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const addCheckup = async (checkupData) => {
    try {
      const { data, error } = await db.createCheckup(checkupData)
      if (error) throw error
      
      setCheckups(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const addContract = async (contractData) => {
    try {
      const { data, error } = await db.createContract(contractData)
      if (error) throw error
      
      setContracts(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    employees,
    appointments,
    sickLeaves,
    checkups,
    contracts,
    medicalRecords,
    loading,
    refreshData,
    addEmployee,
    updateEmployee,
    addAppointment,
    addSickLeave,
    addCheckup,
    addContract
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}