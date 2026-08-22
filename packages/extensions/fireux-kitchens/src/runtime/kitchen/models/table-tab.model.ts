import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { KitchenTableRoundStatus } from './table-round.model.ts'

export type KitchenTableTabStatus = 'open' | 'bill_requested' | 'payment_pending' | 'paid' | 'closed' | 'cancelled'

export interface KitchenTableTab extends FireuxStamped {
  id: string
  kitchen_id: string
  table_id: string
  table_label: string
  status: KitchenTableTabStatus
  host_guest_session_id: string
  guest_count: number
  current_round_id: string
  current_round_number: number
  current_round_status: KitchenTableRoundStatus
  staged_line_count: number
  submitted_round_count: number
  subtotal_chf: number
  paid_chf: number
  outstanding_chf: number
  currency_code: string
  opened_at: FirebaseTimestamp
  bill_requested_at: FirebaseTimestamp
  closed_at: FirebaseTimestamp
}
