import { clsx } from 'clsx'

// Utility function for combining CSS classes
export function cn(...inputs) {
  return clsx(inputs)
}

// Format date to Arabic locale
export function formatDate(date, options = {}) {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

// Format date and time
export function formatDateTime(date) {
  if (!date) return ''
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format currency
export function formatCurrency(amount, currency = 'SAR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Get status color
export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-purple-100 text-purple-800',
    no_show: 'bg-orange-100 text-orange-800'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Get status text in Arabic
export function getStatusText(status) {
  const statusTexts = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    scheduled: 'Scheduled',
    no_show: 'No show',
    healthy: 'Healthy',
    needs_attention: 'Needs attention',
    critical: 'Critical',
    passed: 'Passed',
    failed: 'Failed',
    needs_followup: 'Needs follow-up'
  }
  
  return statusTexts[status] || status
}

// Get role text in Arabic
export function getRoleText(role) {
  const roleTexts = {
    company_admin: 'Company Admin',
    company_hr: 'HR',
    company_manager: 'Manager',
    hospital_admin: 'Hospital Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    receptionist: 'Receptionist',
    employee: 'Employee'
  }
  
  return roleTexts[role] || role
}

// Get organization type text in Arabic
export function getOrganizationTypeText(type) {
  const typeTexts = {
    company: 'Company',
    hospital: 'Hospital'
  }
  
  return typeTexts[type] || type
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone number (Saudi format)
export function validatePhone(phone) {
  const re = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/
  return re.test(phone)
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Calculate age from birth date
export function calculateAge(birthDate) {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get initials from name
export function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

// Check if date is today
export function isToday(date) {
  const today = new Date()
  const checkDate = new Date(date)
  return today.toDateString() === checkDate.toDateString()
}

// Check if date is in the past
export function isPast(date) {
  return new Date(date) < new Date()
}

// Check if date is in the future
export function isFuture(date) {
  return new Date(date) > new Date()
}

// Get days difference between two dates
export function getDaysDifference(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Truncate text
export function truncate(text, length = 50) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Generate random color
export function getRandomColor() {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}