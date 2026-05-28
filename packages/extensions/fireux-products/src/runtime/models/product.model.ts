// FILE: packages/extensions/fireux-products/src/runtime/models/product.model.ts

import {
  FireuxRootScope,
  type FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends null ? null
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

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
export const ProductStorage = {
  shape: 'public/root',
  path: 'products/{productId}',
  collection: 'products',
  idParam: 'productId',
  children: {
    prices: 'products/{productId}/prices/{priceId}',
  },
} as const

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
export type ProductPriceProvider = 'stripe' | 'manual' | string

/**
 * Family: Product child
 * Storage: canonical pricing terms for a root product
 * Path: /products/<productId>/prices/<priceId>
 *
 * Decision note:
 * - ProductPrice owns pricing terms for Product.
 * - Product identity should not be overloaded with plan names such as Pro or Enterprise
 *   when those are price/package terms for the same commercial product.
 * - Provider-specific ids stay on the price record rather than defining Product identity.
 */
export const ProductPriceStorage = {
  shape: 'scoped',
  path: 'products/{productId}/prices/{priceId}',
  collection: 'prices',
  parent: 'product',
  idParam: 'priceId',
} as const

export const ProductPriceModel = {
  id: '',
  product_id: '',
  label: '',
  currency: '',
  unit_amount: 0 as number,
  type: 'one_time' as PriceType,
  interval: undefined as PriceInterval | undefined,
  interval_count: undefined as number | undefined,
  billing_scheme: 'per_unit' as BillingScheme,
  active: true as boolean,
  default: false as boolean,
  provider: 'manual' as ProductPriceProvider,
  provider_price_id: '',
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

export interface ProductPrice {
  id?: string
  product_id?: string
  label?: string
  currency: string
  unit_amount: number
  type?: PriceType
  interval?: PriceInterval
  interval_count?: number
  billing_scheme?: BillingScheme
  active?: boolean
  default?: boolean
  provider?: ProductPriceProvider
  provider_price_id?: string
  metadata?: Record<string, any>
  created?: typeof ProductPriceModel.created
  updated?: typeof ProductPriceModel.updated
}
export type ProductPriceCreateInput = Omit<ProductPrice, 'id' | 'created' | 'updated'>
export type ProductPriceUpdateInput = Partial<
  Omit<ProductPrice, 'id' | 'product_id' | 'created' | 'updated'>
>

// Compatibility alias kept while pricing runtime migrates to ProductPrice naming.
export type Price = ProductPrice

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
  // Compatibility: canonical pricing terms live in /products/<productId>/prices.
  prices: [] as ProductPrice[],
  // Compatibility: use a default ProductPrice record for canonical reads.
  default_price: {
    id: '',
    unit_amount: 0,
    interval: 'month',
  } as DefaultPrice,
  product_type: 'service' as ProductType,
  // Compatibility: stock/capacity belongs in seller or fulfillment records.
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

export type Product = WidenLiteral<typeof ProductModel>

export type ProductCreateInput = Omit<Product, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<
  Omit<Product, 'id' | 'created' | 'updated'>
>

// Compatibility alias kept while product runtime migrates away from implementation-first naming.
export const FirebaseProduct = Product
export type FirebaseProduct = Product
