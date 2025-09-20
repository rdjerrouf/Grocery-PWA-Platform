export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v6m0 8v6m-8-8h6m8 0h6"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>

          <p className="text-gray-600 mb-6">
            It looks like you're not connected to the internet.
            Don't worry, you can still browse previously loaded content.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              What you can do:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View previously loaded pages</li>
              <li>• Check your saved cart items</li>
              <li>• Browse cached product information</li>
              <li>• View your order history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Offline - Grocery PWA',
  description: 'You are currently offline',
}