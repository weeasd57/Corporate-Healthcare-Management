import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

// Format date to Arabic locale
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('ar-EG', defaultOptions).format(new Date(date))
}

// Format currency
export function formatCurrency(amount, currency = 'EGP') {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Egyptian format)
export function isValidPhone(phone) {
  const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/
  return phoneRegex.test(phone)
}

// Get user role display name
export function getRoleDisplayName(role) {
  const roleNames = {
    'company_admin': 'مدير الشركة',
    'company_hr': 'موارد بشرية',
    'company_manager': 'مدير قسم',
    'hospital_admin': 'مدير المستشفى',
    'doctor': 'طبيب',
    'nurse': 'ممرض',
    'receptionist': 'موظف استقبال',
    'employee': 'موظف'
  }
  
  return roleNames[role] || role
}

// Get organization type display name
export function getOrganizationTypeDisplayName(type) {
  const typeNames = {
    'company': 'شركة',
    'hospital': 'مستشفى'
  }
  
  return typeNames[type] || type
}

// Get status display name
export function getStatusDisplayName(status) {
  const statusNames = {
    'active': 'نشط',
    'inactive': 'غير نشط',
    'suspended': 'معلق',
    'pending': 'في الانتظار',
    'approved': 'موافق عليه',
    'rejected': 'مرفوض',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
    'no_show': 'لم يحضر'
  }
  
  return statusNames[status] || status
}

// Get status color
export function getStatusColor(status) {
  const statusColors = {
    'active': 'text-green-600 bg-green-100',
    'inactive': 'text-gray-600 bg-gray-100',
    'suspended': 'text-red-600 bg-red-100',
    'pending': 'text-yellow-600 bg-yellow-100',
    'approved': 'text-green-600 bg-green-100',
    'rejected': 'text-red-600 bg-red-100',
    'completed': 'text-blue-600 bg-blue-100',
    'cancelled': 'text-red-600 bg-red-100',
    'no_show': 'text-orange-600 bg-orange-100'
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}