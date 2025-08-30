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

export interface Product {
  id?: string
  name: string
  description?: string
  images?: ProductImage[]
  features?: ProductFeature[]
  prices?: Price[]
  created_at?: any
  updated_at?: any
}

export interface FirebaseProduct extends Product {
  id: string
  created_at: any
  updated_at: any
  slug?: string
  content?: string
  active?: boolean
  stock?: number | null
  product_type?: 'physical' | 'digital' | 'service'
  track_stock?: boolean
  creator_id?: string
  appId?: string
  metadata?: Record<string, any>
}

export interface ProductCreationInput {
  name: string
  description?: string
  content?: string
  images?: ProductImage[]
  features?: ProductFeature[]
  prices?: Price[]
}

export type ProductId = Product['id']
