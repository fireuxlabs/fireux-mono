// FILE: packages/extensions/fireux-products/src/runtime/models/product.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root-first canonical model
 * Root path: /products/<productId>
 * Console use: may be managed or linked inside consoles without requiring a stored overlay by default
 * Transitional fields: legacy `appId`, `creator_id`, `created_at`, and `updated_at` still remain in the stored shape
 *
 * Decision note:
 * - Product is treated as shared root truth first, but the current stored shape still carries app-coupled transitional fields.
 * - Keep those fields only while existing runtime surfaces still depend on them.
 * - If a console later needs real scoped stored product state, add it intentionally rather than by symmetry.
 * - If that changes, update the models README first, then this file.
 */

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
export const Product = {
  id: '',
  name: '',
  tagline: '',
  Q: '',
  A: '',
  description: '',
  content: '',
  slug: '',
  active: true as boolean,
  main_image: '',
  images: [] as ProductImage[],
  features: [] as ProductFeature[],
  prices: [] as Price[],
  default_price: {
    id: '',
    unit_amount: 0,
    interval: 'month',
  } as DefaultPrice,
  product_type: 'service' as ProductType,
  track_stock: false as boolean,
  stock: null as number | null,
  appId: '',
  metadata: {} as Record<string, any>,
  // Legacy transitional fields still read/written by existing surfaces.
  creator_id: '' as string,
  created_at: '' as string,
  updated_at: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Product = {
  [K in keyof typeof Product]: (typeof Product)[K]
}

export type ProductCreateInput = Omit<Product, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<Omit<ProductCreateInput, 'appId'>>

// Compatibility alias kept while product runtime migrates away from implementation-first naming.
export const FirebaseProduct = Product
export type FirebaseProduct = Product
