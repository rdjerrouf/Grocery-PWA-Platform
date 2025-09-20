'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  EyeOff,
  AlertTriangle,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbProduct = Database['public']['Tables']['products']['Row']
type DbCategory = Database['public']['Tables']['categories']['Row']

interface ProductWithCategory extends DbProduct {
  categories: DbCategory | null
}

interface StoreProductsListProps {
  products: ProductWithCategory[]
  categories: DbCategory[]
  tenant: DbTenant
  locale?: 'fr' | 'ar'
  categoryFilter?: string
  storeAdmin: any
}

export function StoreProductsList({
  products,
  categories,
  tenant,
  locale = 'ar',
  categoryFilter,
  storeAdmin
}: StoreProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const isRTL = locale === 'ar'

  const categoryOptions = [
    { value: 'all', label: locale === 'ar' ? 'كل الفئات' : 'Toutes les catégories' },
    ...categories.map(cat => ({
      value: cat.id,
      label: locale === 'ar' ? (cat.name_ar || cat.name) : (cat.name_fr || cat.name)
    }))
  ]

  const statusOptions = [
    { value: 'all', label: locale === 'ar' ? 'كل المنتجات' : 'Tous les produits' },
    { value: 'active', label: locale === 'ar' ? 'نشط' : 'Actif' },
    { value: 'inactive', label: locale === 'ar' ? 'غير نشط' : 'Inactif' },
    { value: 'low_stock', label: locale === 'ar' ? 'مخزون منخفض' : 'Stock faible' }
  ]

  const filteredProducts = products.filter(product => {
    const productName = locale === 'ar' ? (product.name_ar || product.name) : (product.name_fr || product.name)
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory

    let matchesStatus = true
    if (statusFilter === 'active') matchesStatus = product.is_active
    if (statusFilter === 'inactive') matchesStatus = !product.is_active
    if (statusFilter === 'low_stock') matchesStatus = (product.stock_quantity || 0) < 10

    return matchesSearch && matchesCategory && matchesStatus
  })

  const canEditProducts = storeAdmin.permissions?.products === true

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'ar' ? 'إدارة المنتجات' : 'Gestion des produits'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'ar'
                ? `إدارة منتجات متجر ${tenant.name_ar || tenant.name}`
                : `Gérez les produits du magasin ${tenant.name_fr || tenant.name}`
              }
            </p>
          </div>
          {canEditProducts && (
            <Link
              href={`/stores/${tenant.slug}/admin/products/new?locale=${locale}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {locale === 'ar' ? 'إضافة منتج' : 'Ajouter un produit'}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'text-right' : ''}`}>
          {/* Search */}
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في المنتجات...' : 'Rechercher des produits...'}
              className={`w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              className={`w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              className={`w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {locale === 'ar'
            ? `عرض ${filteredProducts.length} من أصل ${products.length} منتج`
            : `Affichage de ${filteredProducts.length} sur ${products.length} produits`
          }
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const productName = locale === 'ar' ? (product.name_ar || product.name) : (product.name_fr || product.name)
            const categoryName = product.categories
              ? (locale === 'ar' ? (product.categories.name_ar || product.categories.name) : (product.categories.name_fr || product.categories.name))
              : (locale === 'ar' ? 'غير مصنف' : 'Non catégorisé')

            const isLowStock = (product.stock_quantity || 0) < 10

            return (
              <div key={product.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-2 flex gap-1 ${isRTL ? 'left-2' : 'right-2'}`}>
                    {!product.is_active && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        {locale === 'ar' ? 'غير نشط' : 'Inactif'}
                      </span>
                    )}
                    {isLowStock && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {locale === 'ar' ? 'مخزون منخفض' : 'Stock faible'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{productName}</h3>
                    <p className="text-sm text-gray-500">{categoryName}</p>
                    {product.sku && (
                      <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                    )}
                  </div>

                  <div className={`flex justify-between items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {product.price} {tenant.currency}
                      </p>
                      {product.sale_price && (
                        <p className="text-sm text-green-600">
                          {locale === 'ar' ? 'عرض:' : 'Promo:'} {product.sale_price} {tenant.currency}
                        </p>
                      )}
                    </div>
                    <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                      <p className="text-sm text-gray-600">
                        {locale === 'ar' ? 'المخزون:' : 'Stock:'} {product.stock_quantity || 0}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Link
                      href={`/stores/${tenant.slug}/admin/products/${product.id}?locale=${locale}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {locale === 'ar' ? 'عرض' : 'Voir'}
                    </Link>
                    {canEditProducts && (
                      <Link
                        href={`/stores/${tenant.slug}/admin/products/${product.id}/edit?locale=${locale}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {locale === 'ar' ? 'تعديل' : 'Modifier'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'ar' ? 'لا توجد منتجات' : 'Aucun produit'}
            </h3>
            <p className="text-gray-500 mb-4">
              {locale === 'ar'
                ? 'لا توجد منتجات تطابق معايير البحث الحالية'
                : 'Aucun produit ne correspond aux critères de recherche actuels'
              }
            </p>
            {canEditProducts && (
              <Link
                href={`/stores/${tenant.slug}/admin/products/new?locale=${locale}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                {locale === 'ar' ? 'إضافة أول منتج' : 'Ajouter le premier produit'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}