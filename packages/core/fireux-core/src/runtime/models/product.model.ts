export interface ProductFeature {
  id: string
  label: string
  description?: string
}

export interface ProductImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface Price {
  id: string
  currency: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
}

export interface Product {
  id: string
  name: string
  description?: string
  images?: ProductImage[]
  features?: ProductFeature[]
  default_price_id?: string
  prices?: Price[]
}

export type ProductId = Product['id']
