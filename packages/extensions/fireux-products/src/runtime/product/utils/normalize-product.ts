import type { Product, ProductFeature, ProductImage, ProductPrice, ProductRead, ProductUpdateInput, ProductVisibility } from './product.ts'

const record = (value: unknown): Record<string, any> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : null
const text = (value: unknown) => String(value ?? '').trim()
const strings = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : []

export function normalizeProduct(idValue: unknown, value: unknown): Product | null {
  const id = text(idValue)
  const source = record(value)
  if (!id || !source) return null
  const visibility = text(source.visibility)
  const metadata = record(source.metadata)
  return {
    id,
    source_app_id: text(source.source_app_id || source.appId),
    visibility: (visibility === 'public' ? 'public' : 'app') as ProductVisibility,
    name: text(source.name), tagline: text(source.tagline), Q: text(source.Q), A: text(source.A),
    description: text(source.description), content: text(source.content), slug: text(source.slug) || id,
    active: source.active === true, main_image: text(source.main_image),
    images: Array.isArray(source.images) ? source.images as ProductImage[] : [],
    features: Array.isArray(source.features) ? source.features as ProductFeature[] : [],
    categories: strings(source.categories || metadata?.categories),
    brands: strings(source.brands || metadata?.brands),
    source_url: text(source.source_url || metadata?.source_url),
    requires_template: source.requires_template === true || metadata?.availability?.requires_template === true,
    fulfillment_requirements: strings(source.fulfillment_requirements || metadata?.delivery?.requirements),
    product_type: text(source.product_type),
    created: (record(source.created) || { at: source.created_at }) as Product['created'],
    updated: (record(source.updated) || { at: source.updated_at }) as Product['updated'],
  }
}

export function normalizeProductPrice(productIdValue: unknown, priceIdValue: unknown, value: unknown): ProductPrice | null {
  const productId = text(productIdValue)
  const id = text(priceIdValue)
  const source = record(value)
  const currency = text(source?.currency).toLowerCase()
  const unitAmount = Number(source?.unit_amount)
  if (!productId || !id || !source || !currency || !Number.isFinite(unitAmount)) return null
  return {
    id, product_id: productId, label: text(source.label), currency, unit_amount: unitAmount,
    type: source.type === 'recurring' ? 'recurring' : 'one_time',
    interval: ['day', 'week', 'month', 'year'].includes(source.interval) ? source.interval : undefined,
    interval_count: Number.isInteger(source.interval_count) ? source.interval_count : undefined,
    billing_scheme: source.billing_scheme === 'tiered' ? 'tiered' : 'per_unit',
    active: source.active !== false, default: source.default === true,
    provider: text(source.provider) || 'manual', provider_price_id: text(source.provider_price_id),
    metadata: record(source.metadata) || {},
    created: record(source.created) as ProductPrice['created'], updated: record(source.updated) as ProductPrice['updated'],
  }
}

export function joinProductRead(product: Product, prices: ProductPrice[]): ProductRead {
  const activePrices = prices.filter((price) => price.active !== false)
  return { product, prices, defaultPrice: activePrices.find((price) => price.default) || activePrices[0] || null }
}

const PRODUCT_UPDATE_FIELDS = [
  'visibility', 'name', 'tagline', 'Q', 'A', 'description', 'content', 'slug',
  'active', 'main_image', 'images', 'features', 'categories', 'brands', 'source_url', 'requires_template', 'fulfillment_requirements', 'product_type',
] as const

export function normalizeProductUpdate(value: unknown): ProductUpdateInput {
  const source = record(value)
  if (!source) return {}
  return Object.fromEntries(
    PRODUCT_UPDATE_FIELDS
      .filter((field) => field in source)
      .map((field) => [field, source[field]])
  ) as ProductUpdateInput
}
