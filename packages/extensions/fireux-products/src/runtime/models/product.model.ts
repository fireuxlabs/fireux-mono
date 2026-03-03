// FILE: packages/extensions/fireux-products/src/runtime/models/product.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface ProductFeature {
  title: string
  description?: string
  available: boolean
}

export interface ProductImage {
  url: string
  alt?: string
  order?: number
}

export type PriceInterval = 'day' | 'week' | 'month' | 'year'
export type PriceType = 'one_time' | 'recurring'
export type BillingScheme = 'per_unit' | 'tiered'

export interface Price {
  id?: string
  currency: string
  unit_amount: number
  interval?: PriceInterval
  interval_count?: number
  type?: PriceType
  billing_scheme?: BillingScheme
  metadata?: Record<string, any>
}

export interface DefaultPrice {
  id: string
  unit_amount: number
  interval?: PriceInterval
}

export interface StripePriceInput {
  currency: string
  unit_amount: number
  type?: PriceType
  interval?: PriceInterval
  interval_count?: number
  billing_scheme?: BillingScheme
  metadata?: Record<string, any>
}

export type ProductType = string

export interface FirebaseProduct {
  id: string
  name: string
  tagline: string
  Q: string
  A: string
  description: string
  content: string
  slug: string
  active: boolean
  main_image: string
  images: ProductImage[]
  features: ProductFeature[]
  prices: Price[]
  default_price: DefaultPrice
  product_type: ProductType
  track_stock: boolean
  stock: number | null
  appId: string
  metadata: Record<string, any>
  // Transitional draft fields still used by creation state.
  creator_id?: string
  created_at?: string
  updated_at?: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const FirebaseProduct: FirebaseProduct = {
  id: '',
  name: '',
  tagline: '',
  Q: '',
  A: '',
  description: '',
  content: '',
  slug: '',
  active: true,
  main_image: '',
  images: [],
  features: [],
  prices: [],
  default_price: {
    id: '',
    unit_amount: 0,
    interval: 'month',
  },
  product_type: 'service',
  track_stock: false,
  stock: null,
  appId: '',
  metadata: {},
  creator_id: '',
  created_at: '',
  updated_at: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type ProductCreationInput = Omit<FirebaseProduct, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<Omit<ProductCreationInput, 'appId'>>

export const Product = FirebaseProduct
export type Product = FirebaseProduct
