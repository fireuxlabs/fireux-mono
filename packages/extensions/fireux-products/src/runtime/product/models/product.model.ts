import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export interface ProductFeature { title: string; description?: string; available: boolean }
export interface ProductImage { url: string; alt?: string; order?: number }
export type ProductVisibility = 'app' | 'public'
export type ProductType = string
export interface Product extends FireuxStamped {
  id: string
  source_app_id: string
  visibility: ProductVisibility
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
  categories: string[]
  brands: string[]
  source_url: string
  requires_template: boolean
  fulfillment_requirements: string[]
  product_type: ProductType
}
