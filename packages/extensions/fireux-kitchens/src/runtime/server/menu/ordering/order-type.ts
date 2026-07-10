import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'

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
  allowedChannels: readonly KitchenOrderChannel[]
  defaultChannel: KitchenOrderChannel
  destination: MenuOrderDestinationKind
  schedule: MenuOrderScheduleKind
  requiresAcceptance: boolean
  handoff?: MenuOrderHandoffKind
  resolvesDelivery: boolean
  recordsRequestedFor: boolean
}
