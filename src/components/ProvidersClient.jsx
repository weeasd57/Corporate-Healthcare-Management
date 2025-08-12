"use client"

import { AuthProvider, AppProvider, DataProvider } from '@/providers'
import Notifications from '@/components/ui/Notifications'

export default function ProvidersClient({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        <DataProvider>
          {children}
          <Notifications />
        </DataProvider>
      </AppProvider>
    </AuthProvider>
  )
}


