// ~/models/product.model.ts

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

export interface FirebaseProduct extends StripeProduct {
  appId: string
  slug: string
  created_at: Date | string
  updated_at: Date | string
  creator_id: string
  content: string
  product_type: 'physical' | 'digital' | 'service' | 'subscription'
  stock: number | null
  track_stock: boolean
  main_image: string
  default_price?: DefaultPrice

  // Subscription-specific fields
  subscription_type?: 'pro' | 'premium' | 'enterprise'
  features?: string[] // List of features included
  is_default_plan?: boolean // Mark as default app subscription
}
