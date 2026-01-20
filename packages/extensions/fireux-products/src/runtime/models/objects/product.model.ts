// FILE: packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts

/**
 * Product models (Firestore-shape oriented).
 * Firestore (typical): products/{id} (implementation may vary by tenant/app)
 *
 * Notes:
 * - Keep this file free of UI/view models.
 * - Some input/helper shapes here are used by services and admin surfaces.
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

export interface Price {
  id?: string
  currency: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  type?: 'one_time' | 'recurring'
  billing_scheme?: 'per_unit' | 'tiered'
  metadata?: Record<string, any>
}

export interface DefaultPrice {
  id: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
}

export interface StripePriceInput {
  currency: string
  unit_amount: number
  type?: 'one_time' | 'recurring'
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  billing_scheme?: 'per_unit' | 'tiered'
  metadata?: Record<string, any>
}

export type ProductType = 'physical' | 'digital' | 'service' | 'subscription'

/**
 * Canon Firestore Product doc for FireUX apps.
 * (This is what UI + dev drift should target.)
 */
export const FirebaseProduct = {
  id: '',

  name: '',
  description: '',
  content: '',

  slug: '',
  active: false,

  // Media
  main_image: '',
  images: [] as ProductImage[],

  // Optional structured content
  features: [] as ProductFeature[],

  // Commerce
  prices: [] as Price[],
  default_price: {
    id: '',
    unit_amount: 0,
    interval: 'enum:day|week|month|year' as unknown as DefaultPrice['interval'],
  } as DefaultPrice,
  product_type: 'enum:physical|digital|service|subscription' as unknown as ProductType,
  track_stock: false,
  stock: 0 as number | null,

  // Scope
  appId: '',

  // Meta bag
  metadata: {} as Record<string, any>,

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
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
