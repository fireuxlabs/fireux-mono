// FILE: packages/extensions/fireux-products/src/runtime/models/product.model.ts

import {
  FireuxRootScope,
  type FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root-first canonical model
 * Root path: /products/<productId>
 * Console use: may be managed or linked inside consoles without requiring a stored overlay by default
 * Root scope: filtered by source app / ecosystem / owner fields rather than app-local duplication
 *
 * Decision note:
 * - Product is shared root truth first.
 * - App and ecosystem product pages should filter root products through shared root scoping fields.
 * - Do not create app-local product storage unless real app-local workflow state appears later.
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
export const ProductModel = {
  id: '',
  ...FireuxRootScope,
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
  metadata: {} as Record<string, any>,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export const Product = ProductModel

export type Product = {
  [K in keyof typeof ProductModel]: (typeof ProductModel)[K]
}

export type ProductCreateInput = Omit<Product, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<
  Omit<Product, 'id' | 'created' | 'updated'>
>

// Compatibility alias kept while product runtime migrates away from implementation-first naming.
export const FirebaseProduct = Product
export type FirebaseProduct = Product
