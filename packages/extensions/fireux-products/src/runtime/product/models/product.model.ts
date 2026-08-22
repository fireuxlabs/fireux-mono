import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T extends null ? null : T extends readonly (infer U)[] ? WidenLiteral<U>[] : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> } : T

export const ProductStorage = {
  shape: 'root', path: 'products/{productId}', collection: 'products', idParam: 'productId',
  children: { prices: 'products/{productId}/prices/{priceId}' },
} as const

export const ProductEntity = defineFireuxEntity({
  kind: 'entity', name: 'Product', family: 'commerce', identity: 'root',
  authority: 'domain-database', appSupport: 'none', workspace: false,
  root: ProductStorage.path,
  notes: [
    'Product owns commercial identity, App provenance, publication state, and authored content.',
    'ProductPrice children are the sole pricing authority.',
    'SupplierItem is a Supplier-owned offer that links to Product by product_id.',
  ],
})

export interface ProductFeature { title: string; description?: string; available: boolean }
export interface ProductImage { url: string; alt?: string; order?: number }
export type ProductVisibility = 'app' | 'public'
export type ProductType = string
export type PriceInterval = 'day' | 'week' | 'month' | 'year'
export type PriceType = 'one_time' | 'recurring'
export type BillingScheme = 'per_unit' | 'tiered'
export type ProductPriceProvider = 'stripe' | 'manual' | string

export const ProductPriceStorage = {
  shape: 'scoped', path: 'products/{productId}/prices/{priceId}',
  collection: 'prices', parent: 'product', idParam: 'priceId',
} as const

export const ProductPriceDefaults = {
  id: '', product_id: '', label: '', currency: '', unit_amount: 0,
  type: 'one_time' as PriceType,
  interval: undefined as PriceInterval | undefined,
  interval_count: undefined as number | undefined,
  billing_scheme: 'per_unit' as BillingScheme,
  active: true, default: false,
  provider: 'manual' as ProductPriceProvider, provider_price_id: '',
  metadata: {} as Record<string, unknown>,
  created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'], app_id: undefined as FireuxStamped['created']['app_id'] },
  updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] },
} as const

export type ProductPrice = WidenLiteral<typeof ProductPriceDefaults>
export type ProductPriceCreateInput = Omit<ProductPrice, 'id' | 'created' | 'updated'>
export type ProductPriceUpdateInput = Partial<Omit<ProductPrice, 'id' | 'product_id' | 'created' | 'updated'>>

export interface StripePriceInput {
  currency: string; unit_amount: number; type?: PriceType; interval?: PriceInterval
  interval_count?: number; billing_scheme?: BillingScheme; metadata?: Record<string, unknown>
}

export const ProductDefaults = {
  id: '', source_app_id: '', visibility: 'app' as ProductVisibility,
  name: '', tagline: '', Q: '', A: '', description: '', content: '', slug: '',
  active: true, main_image: '', images: [] as ProductImage[],
  features: [] as ProductFeature[], categories: [] as string[], brands: [] as string[],
  source_url: '', requires_template: false, fulfillment_requirements: [] as string[],
  product_type: '' as ProductType,
  created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'], app_id: undefined as FireuxStamped['created']['app_id'] },
  updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] },
} as const

export type Product = WidenLiteral<typeof ProductDefaults>
export type ProductCreateInput = Omit<Product, 'id' | 'created' | 'updated'>
export type ProductUpdateInput = Partial<Omit<Product, 'id' | 'source_app_id' | 'created' | 'updated'>>
export type ProductRead = { product: Product; prices: ProductPrice[]; defaultPrice: ProductPrice | null }

// Transitional vocabulary aliases; both carry only canonical shapes.
export type FirebaseProduct = Product
export type Price = ProductPrice
