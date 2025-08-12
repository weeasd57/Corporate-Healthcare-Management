import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (session?.user) {
          setUser(session.user)
          // Get organization data
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', session.user.user_metadata?.organization_id)
            .single()
          
          if (orgData) {
            setOrganization(orgData)
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Get organization data
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', session.user.user_metadata?.organization_id)
            .single()
          
          if (orgData) {
            setOrganization(orgData)
          }
        } else {
          setUser(null)
          setOrganization(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setOrganization(null)
    }
    return { error }
  }

  return {
    user,
    organization,
    loading,
    signOut,
    signIn: auth.signIn,
    signUp: auth.signUp
  }
}

// Helper functions for common operations
export const auth = {
  signUp: async (email, password, userData) => {
    try {
      // Validate input
      if (!email || !password) {
        return {
          data: null,
          error: {
            message: 'Email and password are required',
            status: 400
          }
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          data: null,
          error: {
            message: 'Invalid email format',
            status: 400
          }
        }
      }

      // Validate password length
      if (password.length < 6) {
        return {
          data: null,
          error: {
            message: 'Password must be at least 6 characters',
            status: 400
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: userData
        }
      })

      if (error) {
        // Improve error messages
        let userMessage = 'Sign up failed'
        if (error.message.includes('User already registered')) {
          userMessage = 'A user with this email already exists. Please sign in instead.'
        } else if (error.message.includes('Password')) {
          userMessage = 'Password must be at least 6 characters long.'
        } else if (error.message.includes('Email')) {
          userMessage = 'Please enter a valid email address.'
        } else if (error.message.includes('Invalid')) {
          userMessage = 'Invalid email or password format.'
        } else if (error.status === 422) {
          userMessage = 'Invalid registration data. Please check your information.'
        }

        return {
          data: null,
          error: {
            ...error,
            message: userMessage
          }
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign up error:', err)
      return {
        data: null,
        error: {
          message: 'Connection error. Please try again.',
          status: 500
        }
      }
    }
  },

  signIn: async (email, password) => {
    try {
      // Validate input
      if (!email || !password) {
        return {
          data: null,
          error: {
            message: 'Email and password are required',
            status: 400
          }
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          data: null,
          error: {
            message: 'Invalid email format',
            status: 400
          }
        }
      }

      // Validate password length
      if (password.length < 6) {
        return {
          data: null,
          error: {
            message: 'Password must be at least 6 characters',
            status: 400
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        // Improve error messages
        let userMessage = 'Sign in failed'
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please confirm your email before signing in'
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many attempts. Please try again later'
        } else if (error.status === 400) {
          userMessage = 'Invalid email or password format'
        }

        return {
          data: null,
          error: {
            ...error,
            message: userMessage
          }
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err.message, err)
      return {
        data: null,
        error: {
          message: 'Connection error. Please try again.',
          status: 500
        }
      }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database operations
export const db = {
  // Organizations
  createOrganization: async (orgData) => {
    const { data, error } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()
    return { data, error }
  },

  getOrganization: async (id) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Users
  createUser: async (userData) => {
    // Try upsert to avoid duplicate email constraint errors during race conditions
    // Then fetch the existing row to return a consistent representation.
    try {
      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'email', ignoreDuplicates: true })

      if (error) {
        // If server returns conflict (409) or other error, attempt to fetch existing user
        // and return it instead of throwing. This makes createUser idempotent.
        if (error?.status === 409 || /conflict/i.test(error.message || '')) {
          if (userData?.email) {
            const fetchExisting = await supabase
              .from('users')
              .select('*')
              .eq('email', userData.email)
              .maybeSingle()
            return { data: fetchExisting.data, error: null }
          }
        }
        return { data: null, error }
      }

      // Fetch row after upsert to return representation
      let data = null
      if (userData?.email) {
        const fetchExisting = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .maybeSingle()
        data = fetchExisting.data
      }

      return { data, error: null }
    } catch (err) {
      // Fallback: try to fetch existing user if possible
      try {
        if (userData?.email) {
          const fetchExisting = await supabase
            .from('users')
            .select('*')
            .eq('email', userData.email)
            .maybeSingle()
          return { data: fetchExisting.data, error: null }
        }
      } catch (e) {}
      return { data: null, error: err }
    }
  },

  getUser: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  getUserByAuthId: async (authId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle()
    return { data, error }
  },

  // Get user and their organization in a single request to reduce round-trips
  getUserWithOrganizationByAuthId: async (authId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('auth_id', authId)
      .maybeSingle()
    return { data, error }
  },

  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    return { data, error }
  },

  getUsersByOrganization: async (orgId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  updateUser: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteUser: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Medical Records
  createMedicalRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('medical_records')
      .insert(recordData)
      .select()
      .single()
    return { data, error }
  },

  getMedicalRecord: async (employeeId) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('employee_id', employeeId)
      .single()
    return { data, error }
  },

  updateMedicalRecord: async (recordId, updates) => {
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single()
    return { data, error }
  },

  // Appointments
  createAppointment: async (appointmentData) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()
    return { data, error }
  },

  getAppointments: async (filters = {}) => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        employee:users!appointments_employee_id_fkey(*),
        doctor:users!appointments_doctor_id_fkey(*),
        hospital:organizations!appointments_hospital_id_fkey(*)
      `)
      .order('appointment_date', { ascending: true })

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }
    if (filters.employeeIds && Array.isArray(filters.employeeIds) && filters.employeeIds.length > 0) {
      query = query.in('employee_id', filters.employeeIds)
    }
    if (filters.hospitalId) {
      query = query.eq('hospital_id', filters.hospitalId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.dateFrom) {
      query = query.gte('appointment_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('appointment_date', filters.dateTo)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  deleteAppointment: async (id) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Checkups
  createCheckup: async (checkupData) => {
    const { data, error } = await supabase
      .from('checkups')
      .insert(checkupData)
      .select()
      .single()
    return { data, error }
  },

  getCheckups: async (filters = {}) => {
    let query = supabase
      .from('checkups')
      .select(`
        *,
        employee:users!checkups_employee_id_fkey(*),
        doctor:users!checkups_doctor_id_fkey(*),
        hospital:organizations!checkups_hospital_id_fkey(*)
      `)
      .order('scheduled_date', { ascending: true })

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }
    if (filters.employeeIds && Array.isArray(filters.employeeIds) && filters.employeeIds.length > 0) {
      query = query.in('employee_id', filters.employeeIds)
    }
    if (filters.hospitalId) {
      query = query.eq('hospital_id', filters.hospitalId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    return { data, error }
  },

  deleteCheckup: async (id) => {
    const { error } = await supabase
      .from('checkups')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Sick Leaves
  createSickLeave: async (sickLeaveData) => {
    const { data, error } = await supabase
      .from('sick_leaves')
      .insert(sickLeaveData)
      .select()
      .single()
    return { data, error }
  },

  getSickLeaves: async (filters = {}) => {
    let query = supabase
      .from('sick_leaves')
      .select(`
        *,
        employee:users!sick_leaves_employee_id_fkey(*)
      `)
      .order('start_date', { ascending: false })

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }
    if (filters.employeeIds && Array.isArray(filters.employeeIds) && filters.employeeIds.length > 0) {
      query = query.in('employee_id', filters.employeeIds)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    return { data, error }
  },

  updateSickLeave: async (id, updates) => {
    const { data, error } = await supabase
      .from('sick_leaves')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteSickLeave: async (id) => {
    const { error } = await supabase
      .from('sick_leaves')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Contracts
  createContract: async (contractData) => {
    const { data, error } = await supabase
      .from('company_hospital_contracts')
      .insert(contractData)
      .select()
      .single()
    return { data, error }
  },

  getContracts: async (filters = {}) => {
    let query = supabase
      .from('company_hospital_contracts')
      .select(`
        *,
        company:organizations!company_hospital_contracts_company_id_fkey(*),
        hospital:organizations!company_hospital_contracts_hospital_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId)
    }
    if (filters.hospitalId) {
      query = query.eq('hospital_id', filters.hospitalId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    return { data, error }
  }

  ,
  // Prescriptions
  createPrescription: async (prescriptionData) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(prescriptionData)
      .select()
      .single()
    return { data, error }
  },

  getPrescriptions: async (filters = {}) => {
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        employee:users!prescriptions_employee_id_fkey(*),
        doctor:users!prescriptions_doctor_id_fkey(*),
        appointment:appointments!prescriptions_appointment_id_fkey(*)
      `)
      .order('prescription_date', { ascending: false })

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }
    if (filters.employeeIds && Array.isArray(filters.employeeIds) && filters.employeeIds.length > 0) {
      query = query.in('employee_id', filters.employeeIds)
    }
    if (filters.doctorId) {
      query = query.eq('doctor_id', filters.doctorId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Medical records helpers
  getMedicalRecordsForEmployees: async (employeeIds = []) => {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return { data: [], error: null }
    }
    const { data, error } = await supabase
      .from('medical_records')
      .select('id, employee_id, health_status, last_checkup_date')
      .in('employee_id', employeeIds)
    return { data, error }
  }
}

export default supabase