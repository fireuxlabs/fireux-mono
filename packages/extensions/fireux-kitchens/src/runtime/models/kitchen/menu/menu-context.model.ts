import type { FulfilmentMode } from '../order.model'

export const OrderingSurfaces = [
  'homeDelivery',
  'tableQr',
  'kiosk',
] as const

export type OrderingSurface = typeof OrderingSurfaces[number]

export const OrderingSurfaceModes = {
  homeDelivery: ['delivery', 'collection'],
  tableQr: ['dineIn'],
  kiosk: ['eatIn', 'takeaway'],
} as const satisfies Record<OrderingSurface, readonly FulfilmentMode[]>

export const MenuRouteContexts = [
  'generic',
  'home',
  'table',
  'kiosk',
  'dine_in',
  'eat_in',
  'takeaway',
  'pre_order',
  'room_service',
] as const

export type MenuRouteContext = typeof MenuRouteContexts[number]
