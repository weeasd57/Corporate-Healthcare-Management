'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, supabase } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  // In-flight map to dedupe concurrent loads for the same auth id
  const inflight = {}

  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) return
    const key = authUser.id
    
    // Check if we already have data for this user
    if (userData && userData.auth_id === authUser.id) {
      console.log('User data already loaded, skipping...')
      return userData
    }
    
    if (inflight[key]) {
      console.log('User data loading in progress, waiting...')
      return inflight[key]
    }

    const promise = (async () => {
      try {
        console.time('loadUserData')
        setUser(authUser)
        
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }

        if (existingUser) {
          setUserData(existingUser)
          // Load organization data
          if (existingUser.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', existingUser.organization_id)
              .single()
            setOrganization(orgData)
          }
          return existingUser
        } else {
          // Create new user
          const { data: created, error: createError } = await supabase
            .from('users')
            .insert([{
              auth_id: authUser.id,
              email: authUser.email,
              first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || 'Unknown',
              last_name: authUser.user_metadata?.last_name || '',
              role: 'employee',
              is_active: true,
              created_at: new Date().toISOString()
            }])
            .select()
            .single()

          if (createError) {
            // Handle 409 Conflict - user might have been created by another process
            if (createError.code === '23505') { // Unique constraint violation
              console.warn('User already exists, fetching existing data...')
              const { data: existing } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authUser.id)
                .single()
              if (existing) {
                setUserData(existing)
                return existing
              }
            }
            throw createError
          }

          setUserData(created)
          return created
        }
      } catch (error) {
        console.error('Load user data error:', error)
        // Don't throw - let UI continue working
        return null
      } finally {
        console.timeEnd('loadUserData')
        delete inflight[key]
      }
    })()

    inflight[key] = promise
    return promise
  }, [userData])

  // Non-blocking auth check: show UI quickly, load user data in background
  const checkAuth = useCallback(async () => {
    try {
      const { user } = await auth.getCurrentUser()
      if (user && !userData) { // Only load if no userData exists
        // do not await to avoid blocking UI
        loadUserData(user).catch((err) => console.error('Background loadUserData error:', err))
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }, [loadUserData, userData])

  useEffect(() => {
    // Check initial auth state
    checkAuth()
    
    // Listen for auth changes. Do NOT block on loading user data here
    // to avoid delaying UI (login spinner/redirect). Load user data
    // in background and handle errors locally.
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !userData) {
        // Only load if no userData exists to avoid duplicate calls
        loadUserData(session.user).catch((err) => console.error('Background loadUserData error:', err))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserData(null)
        setOrganization(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [checkAuth, loadUserData, userData])

  const signIn = async (email, password) => {
    try {
      console.time('auth.signIn')
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      console.timeEnd('auth.signIn')
      return { data, error: null }
    } catch (error) {
      console.timeEnd('auth.signIn')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    userData,
    organization,
    loading,
    signIn,
    signOut,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}