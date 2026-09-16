import type { KitchenOrderType } from '../../../kitchen/utils/order.ts'

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

const menuOrderTypeStrategies = {
  dine_in: {
    type: 'dine_in',
    destination: 'table',
    schedule: 'none',
    handoff: 'table_service',
    resolvesDelivery: false,
    recordsRequestedFor: false,
  },
  eat_in: {
    type: 'eat_in',
    destination: 'none',
    schedule: 'none',
    handoff: 'tray',
    resolvesDelivery: false,
    recordsRequestedFor: false,
  },
  takeaway: {
    type: 'takeaway',
    destination: 'none',
    schedule: 'none',
    handoff: 'bag',
    resolvesDelivery: false,
    recordsRequestedFor: false,
  },
  collection: {
    type: 'collection',
    destination: 'collection',
    schedule: 'collection',
    resolvesDelivery: false,
    recordsRequestedFor: false,
  },
  delivery: {
    type: 'delivery',
    destination: 'none',
    schedule: 'optional_requested_for',
    resolvesDelivery: true,
    recordsRequestedFor: true,
  },
  pre_order: {
    type: 'pre_order',
    destination: 'none',
    schedule: 'requested_for',
    handoff: 'table_service',
    resolvesDelivery: false,
    recordsRequestedFor: true,
  },
  room_service: {
    type: 'room_service',
    destination: 'room_service',
    schedule: 'none',
    resolvesDelivery: false,
    recordsRequestedFor: false,
  },
} satisfies Record<KitchenOrderType, MenuOrderTypeStrategy>

export const menuOrderTypeStrategy = (
  type: KitchenOrderType
): MenuOrderTypeStrategy => menuOrderTypeStrategies[type]

export const menuOrderTypeStrategiesList = () =>
  Object.values(menuOrderTypeStrategies)
