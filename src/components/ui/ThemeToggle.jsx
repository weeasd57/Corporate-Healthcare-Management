"use client"

import { useApp } from '@/providers/AppProvider'
import Button from './Button'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useApp()
  return (
    <Button
      type="button"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`relative h-9 w-9 p-0 rounded-full ${className}`}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 text-yellow-500 ${
          theme === 'dark' ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 text-blue-500 ${
          theme === 'dark' ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}


