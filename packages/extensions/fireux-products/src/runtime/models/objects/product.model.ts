// FILE: packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts

/**
 * Product (canonical Firestore shape)
 * Firestore: apps/{appId}/products/{id}
 *
 * Principles:
 * - Stored shape only (no UI / view models)
 * - Default values keep migrations painless
 * - Empty string = unset
 */

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

export type ProductType = 'physical' | 'digital' | 'service' | 'subscription'

/**
 * Canon Firestore Product doc for FireUX apps.
 * (This is what UI + dev drift should target.)
 */
export const FirebaseProduct = {
  id: '' as string,

  name: '' as string,
  description: '' as string,
  content: '' as string,

  slug: '' as string,
  active: true as boolean,

  // Media
  main_image: '' as string,
  images: [] as ProductImage[],

  // Optional structured content
  features: [] as ProductFeature[],

  // Commerce (prices can be hydrated at read-time; stored shape may keep this empty)
  prices: [] as Price[],
  default_price: {
    id: '' as string,
    unit_amount: 0 as number,
    interval: 'month' as DefaultPrice['interval'],
  } as DefaultPrice,
  product_type: 'service' as ProductType,
  track_stock: false as boolean,
  stock: null as number | null,

  // Scope
  appId: '' as string,

  // Meta bag
  metadata: {} as Record<string, any>,

  // Stamps
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type FirebaseProduct = {
  [K in keyof typeof FirebaseProduct]: (typeof FirebaseProduct)[K]
}

export type ProductCreationInput = Omit<
  FirebaseProduct,
  'id' | 'created_at' | 'updated_at' | 'creator_id'
>

export type ProductUpdateInput = Partial<Omit<ProductCreationInput, 'appId'>>

// Optional alias for consistency with other runtime models.
export const Product = FirebaseProduct
export type Product = FirebaseProduct
