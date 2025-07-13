// ~/models/product.model.ts

import type { FirestoreObject } from './object.model'

export interface Price {
  id: string
  active: boolean
  billing_scheme: 'per_unit' | 'tiered'
  currency: string
  unit_amount: number
  type: 'one_time' | 'recurring'
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  metadata?: Record<string, unknown>
}

export type DefaultPrice = {
  id: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
}

export type StripePriceInput = Omit<Price, 'id' | 'active'>

export interface StripeProduct {
  id: string
  name: string
  description: string
  images: string[]
  active: boolean
  prices: Price[]
}

export type StripeProductInput = Omit<StripeProduct, 'id' | 'prices'> & {
  prices: StripePriceInput[]
}

export interface FirebaseProduct extends StripeProduct, FirestoreObject {
  product_type: 'physical' | 'digital' | 'service' | 'subscription'

  // Stripe compatibility fields
  tax_code?: string | null
  metadata: {
    appId: string
    slug: string
    product_type: string
    [key: string]: any
  }

  // Stripe metadata as flat fields (for webhook compatibility)
  stripe_metadata_appId: string
  stripe_metadata_slug: string
  stripe_metadata_product_type: string

  // FireUX simplified price structure
  stripe_prices: {
    id: string
    unit_amount: number
    currency: string
    interval?: string | null
    interval_count?: number | null
    type?: string
  }[]

  // FireUX tracking fields
  fireux_created: boolean
  sync_source: string

  // Optional additional fields
  content?: string
  stock?: number | null
  track_stock?: boolean
  main_image?: string
  default_price?: DefaultPrice

  // Subscription-specific fields
  subscription_type?: 'pro' | 'premium' | 'enterprise'
  features?: string[] // List of features included
  is_default_plan?: boolean // Mark as default app subscription
}

export type ProductCreationInput = Omit<
  FirebaseProduct,
  'id' | 'created_at' | 'updated_at' | 'default_price' | 'prices'
>
