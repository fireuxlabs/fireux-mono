import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { BillingScheme, PriceInterval, PriceType, ProductPrice } from '../models/product-price.model.ts'

export type { BillingScheme, PriceInterval, PriceType, ProductPrice, ProductPriceProvider } from '../models/product-price.model.ts'

export const ProductPriceStorage = {
  shape: 'scoped', path: 'products/{productId}/prices/{priceId}',
  collection: 'prices', parent: 'product', idParam: 'priceId',
} as const

export const ProductPriceDefaults: ProductPrice = {
  id: '', product_id: '', label: '', currency: '', unit_amount: 0, type: 'one_time',
  billing_scheme: 'per_unit', active: true, default: false, provider: 'manual',
  provider_price_id: '', metadata: {}, created: { at: {} as FirebaseTimestamp },
  updated: { at: {} as FirebaseTimestamp },
}

export type ProductPriceCreateInput = Omit<ProductPrice, 'id' | 'created' | 'updated'>
export type ProductPriceUpdateInput = Partial<Omit<ProductPrice, 'id' | 'product_id' | 'created' | 'updated'>>

export interface StripePriceInput {
  currency: string
  unit_amount: number
  type?: PriceType
  interval?: PriceInterval
  interval_count?: number
  billing_scheme?: BillingScheme
  metadata?: Record<string, unknown>
}
