// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: define the Kitchen-owned immutable Sale record.
// Concurrent edit — 2026-07-21 17:04 CEST — Kitchen Finance surface: keep Finance model types resolvable in consuming Nuxt apps.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type {
  KitchenOrderChannel,
  KitchenOrderPricing,
  KitchenOrderType,
} from './order.model'

/**
 * Family: Kitchen-owned immutable fact record
 * Storage: parent-owned record derived one-to-one from a completed Order
 * Path: apps/{appId}/kitchens/{kitchenId}/sales/{saleId}
 *
 * KitchenSale is not an entity: its id and lifecycle are derived from Order.
 */
export const KitchenSaleStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/sales/{saleId}',
  collection: 'sales',
  parent: 'kitchen',
  idParam: 'saleId',
} as const

export const KitchenSaleSchemaVersion = 1 as const

export type KitchenSaleLine = {
  id: string
  source_item_id: string
  menu_id: string
  dish_id: string
  label: string
  quantity: number
  unit_price: FinancialMoney
  line_total: FinancialMoney
  item_kind?: string
  variant_id?: string
  variant_label?: string
}

export type KitchenSale<TTimestamp = FirebaseTimestamp> = {
  id: string
  schema_version: typeof KitchenSaleSchemaVersion
  app_id: string
  kitchen_id: string
  menu_id: string
  order_id: string
  order_path: string
  order_number: string
  order_type: KitchenOrderType
  channel: KitchenOrderChannel
  lines: KitchenSaleLine[]
  pricing: KitchenOrderPricing
  financial_fact_id: string
  occurred_at: TTimestamp
  recorded_at: TTimestamp
  actor: {
    kind: 'user'
    id: string
  }
}

export function kitchenSalePath(input: {
  appId: string
  kitchenId: string
  saleId: string
}): string {
  return `apps/${input.appId}/kitchens/${input.kitchenId}/sales/${input.saleId}`
}
