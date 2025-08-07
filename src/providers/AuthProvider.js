'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (authUser) => {
    try {
      setUser(authUser)
      
      // Load user data from database
      const { data: foundUser } = await db.getUserByAuthId(authUser.id)
      if (foundUser) {
        setUserData(foundUser)
        const { data: orgData } = await db.getOrganization(foundUser.organization_id)
        setOrganization(orgData)
        return
      }

      // Fallback: create user row from auth metadata if missing
      const meta = authUser.user_metadata || {}
      if (meta.organization_id) {
        const { data: created } = await db.createUser({
          auth_id: authUser.id,
          organization_id: meta.organization_id,
          email: authUser.email,
          first_name: meta.first_name || '',
          last_name: meta.last_name || '',
          role: meta.role || 'employee',
          is_active: true
        })
        if (created) {
          setUserData(created)
          const { data: orgData } = await db.getOrganization(created.organization_id)
          setOrganization(orgData)
        }
      }
    } catch (error) {
      console.error('Load user data error:', error)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const { user } = await auth.getCurrentUser()
      if (user) {
        await loadUserData(user)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }, [loadUserData])

  useEffect(() => {
    // Check initial auth state
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserData(null)
        setOrganization(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [checkAuth, loadUserData])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
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