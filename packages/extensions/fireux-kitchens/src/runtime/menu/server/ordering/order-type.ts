// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: support optional requested-time strategies.
import type { KitchenOrderType } from '../../../kitchen/models/order.model.ts'

export type MenuOrderDestinationKind =
  | 'none'
  | 'collection'
  | 'room_service'
  | 'table'

export type MenuOrderScheduleKind =
  | 'none'
  | 'collection'
  | 'requested_for'
  | 'optional_requested_for'

export type MenuOrderHandoffKind = 'table_service' | 'tray' | 'bag'

export type MenuOrderTypeStrategy = {
  type: KitchenOrderType
  destination: MenuOrderDestinationKind
  schedule: MenuOrderScheduleKind
  handoff?: MenuOrderHandoffKind
  resolvesDelivery: boolean
  recordsRequestedFor: boolean
}
