export const MenuRouteContexts = [
  'generic',
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
  'from_home',
  'in_store',
  'kiosk',
  'from_table',
  'from_room',
] as const

export type MenuRouteContext = typeof MenuRouteContexts[number]
