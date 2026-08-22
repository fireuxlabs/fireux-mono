import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type PriceInterval = 'day' | 'week' | 'month' | 'year'
export type PriceType = 'one_time' | 'recurring'
export type BillingScheme = 'per_unit' | 'tiered'
export type ProductPriceProvider = 'stripe' | 'manual' | string

export interface ProductPrice extends FireuxStamped {
  id: string
  product_id: string
  label: string
  currency: string
  unit_amount: number
  type: PriceType
  interval?: PriceInterval
  interval_count?: number
  billing_scheme: BillingScheme
  active: boolean
  default: boolean
  provider: ProductPriceProvider
  provider_price_id: string
  metadata: Record<string, unknown>
}
