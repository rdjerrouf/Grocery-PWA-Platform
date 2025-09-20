'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createOrder } from '@/app/actions/orders'
import { ShoppingBag, CreditCard, Banknote, MapPin, User, Phone, Mail } from 'lucide-react'

interface CheckoutFormProps {
  tenant: any
  cartItems: any[]
  userProfile: any
  locale: 'fr' | 'ar'
}

const ALGERIA_WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
  '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
  '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
  '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
  '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
  '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
  '56 - Djanet', '57 - El M\'Ghair', '58 - El Menia'
]

export function CheckoutForm({ tenant, cartItems, userProfile, locale }: CheckoutFormProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  
  const [formData, setFormData] = useState({
    customer_name: userProfile?.name || '',
    customer_phone: userProfile?.phone || '',
    customer_email: userProfile?.email || '',
    delivery_address: userProfile?.address || '',
    wilaya: userProfile?.wilaya || '',
    commune: userProfile?.commune || '',
    notes: '',
    payment_method: 'cash' as 'cash' | 'card',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products
    return sum + (product.price * item.quantity)
  }, 0)

  const deliveryFee = tenant.delivery_fee || 0
  const total = subtotal + deliveryFee

  const formatPrice = (price: number) => `${price.toFixed(2)} DZD`

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = locale === 'ar' ? 'الاسم مطلوب' : 'Le nom est requis'
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = locale === 'ar' ? 'رقم الهاتف مطلوب' : 'Le téléphone est requis'
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.customer_phone)) {
      newErrors.customer_phone = locale === 'ar' ? 'رقم هاتف غير صحيح' : 'Numéro de téléphone invalide'
    }

    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = locale === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Email invalide'
    }

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = locale === 'ar' ? 'عنوان التوصيل مطلوب' : 'L\'adresse de livraison est requise'
    }

    if (!formData.wilaya) {
      newErrors.wilaya = locale === 'ar' ? 'الولاية مطلوبة' : 'La wilaya est requise'
    }

    if (!formData.commune.trim()) {
      newErrors.commune = locale === 'ar' ? 'البلدية مطلوبة' : 'La commune est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await createOrder({
        tenant_id: tenant.id,
        tenant_slug: tenant.slug,
        ...formData,
      })

      if (result.success) {
        router.push(`/stores/${tenant.slug}/orders/${result.order?.id}?success=true`)
      } else {
        setErrors({ general: result.error || 'Une erreur est survenue' })
      }
    } catch (error) {
      setErrors({ general: locale === 'ar' ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
      {/* Order Summary */}
      <div className="lg:order-2">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'ملخص الطلب' : 'Résumé de la commande'}
        </h2>

        <div className="mt-4 bg-white rounded-lg shadow p-6">
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-gray-200">
              {cartItems.map((item) => {
                const product = item.products
                return (
                  <li key={item.id} className="flex py-6">
                    <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={locale === 'ar' ? product.name_ar || product.name : product.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div>
                        <div className={`flex justify-between text-base font-medium text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h3>
                            {locale === 'ar' ? product.name_ar || product.name : product.name}
                          </h3>
                          <p className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                            {formatPrice(product.price * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatPrice(product.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className={`flex justify-between text-base font-medium text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p>{locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            <div className={`flex justify-between text-base text-gray-600 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p>{locale === 'ar' ? 'رسوم التوصيل' : 'Frais de livraison'}</p>
              <p>{formatPrice(deliveryFee)}</p>
            </div>
            <div className={`flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p>{locale === 'ar' ? 'المجموع الكلي' : 'Total'}</p>
              <p>{formatPrice(total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="lg:order-1">
        <div className="mt-10 lg:mt-0">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            {locale === 'ar' ? 'معلومات العميل' : 'Informations client'}
          </h2>

          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.customer_name ? 'border-red-300' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.customer_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Phone className="inline h-4 w-4 mr-1" />
                  {locale === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.customer_phone ? 'border-red-300' : ''}`}
                  dir="ltr"
                />
                {errors.customer_phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.customer_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Mail className="inline h-4 w-4 mr-1" />
                  {locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (optionnel)'}
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.customer_email ? 'border-red-300' : ''}`}
                  dir="ltr"
                />
                {errors.customer_email && (
                  <p className="mt-2 text-sm text-red-600">{errors.customer_email}</p>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mt-8 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {locale === 'ar' ? 'عنوان التوصيل' : 'Adresse de livraison'}
          </h2>

          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الولاية' : 'Wilaya'}
                </label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => handleInputChange('wilaya', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.wilaya ? 'border-red-300' : ''}`}
                >
                  <option value="">{locale === 'ar' ? 'اختر الولاية' : 'Choisir une wilaya'}</option>
                  {ALGERIA_WILAYAS.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
                {errors.wilaya && (
                  <p className="mt-2 text-sm text-red-600">{errors.wilaya}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'البلدية' : 'Commune'}
                </label>
                <input
                  type="text"
                  value={formData.commune}
                  onChange={(e) => handleInputChange('commune', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.commune ? 'border-red-300' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.commune && (
                  <p className="mt-2 text-sm text-red-600">{errors.commune}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'العنوان التفصيلي' : 'Adresse détaillée'}
                </label>
                <textarea
                  rows={3}
                  value={formData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.delivery_address ? 'border-red-300' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.delivery_address && (
                  <p className="mt-2 text-sm text-red-600">{errors.delivery_address}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Notes supplémentaires (optionnel)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mt-8">
            {locale === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}
          </h2>

          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="cash"
                  name="payment_method"
                  type="radio"
                  checked={formData.payment_method === 'cash'}
                  onChange={() => handleInputChange('payment_method', 'cash')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="cash" className={`${isRTL ? 'mr-3' : 'ml-3'} block text-sm font-medium text-gray-700 flex items-center gap-2`}>
                  <Banknote className="h-5 w-5" />
                  {locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="card"
                  name="payment_method"
                  type="radio"
                  checked={formData.payment_method === 'card'}
                  onChange={() => handleInputChange('payment_method', 'card')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="card" className={`${isRTL ? 'mr-3' : 'ml-3'} block text-sm font-medium text-gray-700 flex items-center gap-2`}>
                  <CreditCard className="h-5 w-5" />
                  {locale === 'ar' ? 'بطاقة الدفع' : 'Carte de paiement'}
                  <span className="text-xs text-gray-500">({locale === 'ar' ? 'قريباً' : 'Bientôt disponible'})</span>
                </label>
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="mt-10">
            <Button
              type="submit"
              disabled={isSubmitting || formData.payment_method === 'card'}
              className="w-full"
              size="lg"
            >
              {isSubmitting
                ? (locale === 'ar' ? 'جاري المعالجة...' : 'Traitement en cours...')
                : (locale === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande')
              }
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}