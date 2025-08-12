"use client"

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Settings, X } from 'lucide-react'

export default function FloatingSettings() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClickOutside = (e) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [open])

  return (
    <div className="fixed left-4 bottom-4 z-50" ref={panelRef}>
      <div className="relative">
        {/* Floating gear button */}
        <Button
          type="button"
          aria-label={open ? 'Close settings' : 'Open settings'}
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="h-12 w-12 rounded-full p-0 bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
        >
          <Settings className={`h-6 w-6 text-gray-700 dark:text-gray-200 transition-transform ${open ? 'rotate-90' : ''}`} />
        </Button>

        {/* Panel */}
        <div
          className={`absolute bottom-16 left-0 w-56 origin-bottom-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl p-4 transition-all duration-200 ${
            open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
          role="dialog"
          aria-label="Quick settings"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Quick settings</span>
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


