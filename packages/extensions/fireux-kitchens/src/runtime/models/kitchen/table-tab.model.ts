import type { FireuxStamped } from 'fireux-core/runtime/models/utils/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Kitchen-scoped table service
 * Storage: scoped operational entity
 * Path: /kitchens/<kitchenId>/table_tabs/<tableTabId>
 *
 * A tab represents one visit at a physical table. Kitchen orders remain
 * independent tickets and reference the tab after a staged round is sent.
 */
export const KitchenTableTabStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}',
  collection: 'table_tabs',
  parent: 'kitchen',
  idParam: 'tableTabId',
} as const

export const KitchenTableRoundStorage = {
  shape: 'scoped-child',
  path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}/rounds/{roundId}',
  collection: 'rounds',
  parent: 'table_tab',
  idParam: 'roundId',
} as const

export type KitchenTableTabStatus =
  | 'open'
  | 'bill_requested'
  | 'payment_pending'
  | 'paid'
  | 'closed'
  | 'cancelled'

export type KitchenTableRoundStatus =
  | 'staging'
  | 'sending'
  | 'submitted'
  | 'cancelled'

export type KitchenTableRoundLine = {
  id: string
  guest_session_id: string
  menu_id: string
  menu_item_id: string
  label: string
  quantity: number
  unit_price_chf: number
  subtotal_chf: number
}

export const KitchenTableTabModel = {
  id: '' as string,
  kitchen_id: '' as string,

  table_id: '' as string,
  table_label: '' as string,
  status: 'open' as KitchenTableTabStatus,
  host_guest_session_id: '' as string,
  guest_count: 0 as number,

  current_round_id: '' as string,
  current_round_number: 0 as number,
  current_round_status: 'staging' as KitchenTableRoundStatus,
  staged_line_count: 0 as number,
  submitted_round_count: 0 as number,

  subtotal_chf: 0 as number,
  paid_chf: 0 as number,
  outstanding_chf: 0 as number,
  currency_code: '' as string,

  opened_at: {} as FirebaseTimestamp,
  bill_requested_at: {} as FirebaseTimestamp,
  closed_at: {} as FirebaseTimestamp,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export const KitchenTableRoundModel = {
  id: '' as string,
  kitchen_id: '' as string,
  table_tab_id: '' as string,
  number: 0 as number,
  status: 'staging' as KitchenTableRoundStatus,
  version: 0 as number,
  lines: [] as KitchenTableRoundLine[],
  subtotal_chf: 0 as number,
  order_id: '' as string,
  submitted_at: {} as FirebaseTimestamp,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type KitchenTableTab = {
  [K in keyof typeof KitchenTableTabModel]: (typeof KitchenTableTabModel)[K]
}

export type KitchenTableRound = {
  [K in keyof typeof KitchenTableRoundModel]: (typeof KitchenTableRoundModel)[K]
}
