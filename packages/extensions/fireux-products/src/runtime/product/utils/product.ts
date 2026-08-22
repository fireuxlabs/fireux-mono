import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { ProductPrice } from '../models/product-price.model.ts'
import type { Product } from '../models/product.model.ts'

export type { Product, ProductFeature, ProductImage, ProductType, ProductVisibility } from '../models/product.model.ts'
export * from './product-price.ts'

export const ProductStorage = {
  shape: 'root', path: 'products/{productId}', collection: 'products', idParam: 'productId',
  children: { prices: 'products/{productId}/prices/{priceId}' },
} as const

export const ProductDefaults: Product = {
  id: '', source_app_id: '', visibility: 'app', name: '', tagline: '', Q: '', A: '',
  description: '', content: '', slug: '', active: true, main_image: '', images: [],
  features: [], categories: [], brands: [], source_url: '', requires_template: false,
  fulfillment_requirements: [], product_type: '',
  created: { at: {} as FirebaseTimestamp }, updated: { at: {} as FirebaseTimestamp },
}

export type ProductCreateInput = Omit<Product, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<Omit<Product, 'id' | 'source_app_id' | 'created' | 'updated'>>
export type ProductRead = { product: Product; prices: ProductPrice[]; defaultPrice: ProductPrice | null }
