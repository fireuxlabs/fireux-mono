import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type { KitchenOrderPricing } from './order.model'
import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from './order-lifecycle.model'

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
  sellable_id?: string
  sellable_revision?: number
}

export type KitchenSale<TTimestamp = FirebaseTimestamp> = {
  id: string
  schema_version: 1
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
  actor: { kind: 'user'; id: string }
}
