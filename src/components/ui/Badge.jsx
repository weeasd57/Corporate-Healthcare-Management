import { cn, getStatusColor } from '@/lib/utils'

const Badge = ({ 
  children, 
  variant = 'default', 
  status,
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }
  
  // If status is provided, use status color instead of variant
  const colorClasses = status ? getStatusColor(status) : variants[variant]
  
  return (
    <span
      className={cn(
        baseClasses,
        colorClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge