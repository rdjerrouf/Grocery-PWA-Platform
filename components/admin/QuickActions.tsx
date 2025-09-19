'use client'

import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <Link
          href="/admin/products/new"
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Product
        </Link>
        <Link
          href="/admin/stores/new"
          className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          Create New Store
        </Link>
        <Link
          href="/admin/categories/new"
          className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          Add Category
        </Link>
        <Link
          href="/admin/products?filter=low-stock"
          className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Review Low Stock
        </Link>
      </div>
    </div>
  )
}