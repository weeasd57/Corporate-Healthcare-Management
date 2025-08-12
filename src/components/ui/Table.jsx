import { cn } from '@/lib/utils'

const Table = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn(
          'w-full caption-bottom text-sm text-gray-900 dark:text-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

const TableHeader = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <thead className={cn('[&_tr]:border-b border-gray-200 dark:border-gray-800', className)} {...props}>
      {children}
    </thead>
  )
}

const TableBody = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
      {children}
    </tbody>
  )
}

const TableFooter = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tfoot className={cn('bg-gray-50 dark:bg-black/60 font-medium [&>tr]:last:border-b-0', className)} {...props}>
      {children}
    </tfoot>
  )
}

const TableRow = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-black/60 data-[state=selected]:bg-gray-50 dark:data-[state=selected]:bg-black/60',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

const TableHead = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <th
      className={cn(
        'h-12 px-4 text-right align-middle font-medium text-gray-500 dark:text-gray-300 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

const TableCell = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <td
      className={cn(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

const TableCaption = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <caption
      className={cn('mt-4 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </caption>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

export default Table