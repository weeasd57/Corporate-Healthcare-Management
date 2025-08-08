import { cn } from '@/lib/utils'

export const Card = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  actions,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2 space-x-reverse">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="p-6 pt-4">
        {children}
      </div>
    </div>
  )
}

export default Card