import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
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
    // Use upsert to avoid duplicate email constraint errors during race conditions
    let { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'email', ignoreDuplicates: true })
      .select()
      .maybeSingle()

    // If ignored (no row returned), fetch existing by email
    if (!data && !error && userData?.email) {
      const fetchExisting = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .maybeSingle()
      data = fetchExisting.data
      error = fetchExisting.error
    }

    return { data, error }
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
}

export default supabase