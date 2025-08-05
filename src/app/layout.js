import './globals.css'

export const metadata = {
  title: 'تطبيق الشركة والمستشفى',
  description: 'نظام إدارة الصحة للشركات والمستشفيات',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
