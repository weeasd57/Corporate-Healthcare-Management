'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Stethoscope, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const router = useRouter()

  // Keep landing accessible; do not auto-redirect

  return (
    <div className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-black dark:via-black dark:to-black" />
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-600/20" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-600/20" />

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-green-600" />
          <Stethoscope className="h-7 w-7 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">CHMS</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/auth/login')}>Sign in</Button>
          <Button onClick={() => router.push('/auth/register/company')}>Get Started</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              A modern health platform for companies and hospitals
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-xl">
              Manage employees’ medical records, appointments, and health programs with secure access and real-time collaboration.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => router.push('/auth/register/company')}>Register a Company</Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/auth/register/hospital')}>Register a Hospital</Button>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Already have an account? <button className="underline" onClick={() => router.push('/auth/login')}>Sign in</button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/70 dark:bg-black/60 shadow-xl p-6 backdrop-blur">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Appointments</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Fast booking</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Medical Files</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Secure storage</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Checkups</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Automated flow</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Reports</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Actionable insights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Role-based access', desc: 'Secure RLS policies with Supabase and granular access per organization.' },
              { title: 'Real-time updates', desc: 'Stay synced across teams with instant data refresh.' },
              { title: 'Scalable architecture', desc: 'Modern Next.js app with optimized data fetching and caching.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/60 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        
      </main>
    </div>
  )
}
