import './globals.css'
import ProvidersClient from '@/components/ProvidersClient'
import ThemeToggle from '@/components/ui/ThemeToggle'
import FloatingSettings from '@/components/ui/FloatingSettings'

export const metadata = {
  title: 'Company & Hospital App',
  description: 'Health management system for companies and hospitals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-white text-gray-900 dark:bg-black dark:text-gray-100">
        <ProvidersClient>
          {children}
          <FloatingSettings />
        </ProvidersClient>
      </body>
    </html>
  )
}
