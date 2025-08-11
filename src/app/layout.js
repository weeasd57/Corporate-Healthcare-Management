import './globals.css'
import { AuthProvider, AppProvider, DataProvider } from '@/providers'
import Notifications from '@/components/ui/Notifications'

export const metadata = {
  title: 'Company & Hospital App',
  description: 'Health management system for companies and hospitals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <AuthProvider>
          <AppProvider>
            <DataProvider>
              {children}
              <Notifications />
            </DataProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
