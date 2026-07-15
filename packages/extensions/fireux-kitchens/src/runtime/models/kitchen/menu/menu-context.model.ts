export const MenuRouteContexts = [
  'generic',
  'home',
  'delivery',
  'collection',
  'table',
  'kiosk',
  'staff_pos',
  'dine_in',
  'pre_order',
  'room_service',
] as const

export type MenuRouteContext = typeof MenuRouteContexts[number]

export const MenuSurfaces = [
  'generic',
  'home',
  'dine_in',
  'kiosk',
  'pre_order',
  'room_service',
  'staff_pos',
] as const

export type MenuSurface = typeof MenuSurfaces[number]
