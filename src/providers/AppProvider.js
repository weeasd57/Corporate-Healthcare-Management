'use client'

import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const showLoading = () => setLoading(true)
  const hideLoading = () => setLoading(false)

  const showError = (message) => {
    setError(message)
    addNotification({
      type: 'error',
      title: 'خطأ',
      message
    })
  }

  const clearError = () => setError(null)

  const value = {
    sidebarOpen,
    setSidebarOpen,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    loading,
    showLoading,
    hideLoading,
    error,
    showError,
    clearError
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}