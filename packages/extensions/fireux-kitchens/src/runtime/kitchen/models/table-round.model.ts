import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type KitchenTableRoundStatus = 'staging' | 'sending' | 'submitted' | 'cancelled'
export interface KitchenTableRoundLine { id: string; guest_session_id: string; menu_id: string; menu_item_id: string; label: string; quantity: number; unit_price_chf: number; subtotal_chf: number }
export interface KitchenTableRound extends FireuxStamped {
  id: string
  kitchen_id: string
  table_tab_id: string
  number: number
  status: KitchenTableRoundStatus
  version: number
  lines: KitchenTableRoundLine[]
  subtotal_chf: number
  order_id: string
  submitted_at: FirebaseTimestamp
}
