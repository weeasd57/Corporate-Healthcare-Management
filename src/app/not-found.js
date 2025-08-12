import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Page not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
          
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}