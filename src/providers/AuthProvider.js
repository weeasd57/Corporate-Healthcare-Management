'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const loadUserData = useCallback(async (authUser) => {
    try {
      setUser(authUser)
      
      // Load user data from database
      const { data: userData } = await db.getUserByAuthId(authUser.id)
      if (userData) {
        setUserData(userData)
        
        // Load organization data
        const { data: orgData } = await db.getOrganization(userData.organization_id)
        setOrganization(orgData)
      }
    } catch (error) {
      console.error('Load user data error:', error)
    }
  }, [])

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