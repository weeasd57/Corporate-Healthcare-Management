import './globals.css'
import { AuthProvider, AppProvider, DataProvider } from '@/providers'
import Notifications from '@/components/ui/Notifications'

export const metadata = {
  title: 'تطبيق الشركة والمستشفى',
  description: 'نظام إدارة الصحة للشركات والمستشفيات',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
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
