import type { KitchenOrderType } from '../../../models/kitchen/order.model.ts'

export type MenuOrderDestinationKind =
  | 'none'
  | 'collection'
  | 'room_service'
  | 'table'

export type MenuOrderScheduleKind =
  | 'none'
  | 'collection'
  | 'requested_for'

export type MenuOrderHandoffKind = 'table_service' | 'tray' | 'bag'

export type MenuOrderTypeStrategy = {
  type: KitchenOrderType
  destination: MenuOrderDestinationKind
  schedule: MenuOrderScheduleKind
  handoff?: MenuOrderHandoffKind
  resolvesDelivery: boolean
  recordsRequestedFor: boolean
}
