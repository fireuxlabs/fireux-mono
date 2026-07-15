import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../models/kitchen/order.model'
import {
  MenuRouteContexts,
  type MenuRouteContext,
  type MenuSurface,
} from '../models/kitchen/menu/menu-context.model'

export type MenuContextProfile = {
  context: MenuRouteContext
  surface: MenuSurface
  label: string
  icon: string
  visibleOrderTypes: KitchenOrderType[]
  defaultOrderType?: KitchenOrderType
  locked: boolean
}

export type MenuRouteTarget = {
  menuId: string
  context: MenuRouteContext
}

const text = (value: unknown) => String(value ?? '').trim()
const contextSet = new Set<string>(MenuRouteContexts)

const profiles: Record<MenuRouteContext, MenuContextProfile> = {
  generic: {
    context: 'generic',
    surface: 'generic',
    label: '',
    icon: 'i-lucide-book-open',
    visibleOrderTypes: [],
    locked: false,
  },
  home: {
    context: 'home',
    surface: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    visibleOrderTypes: ['delivery', 'collection'],
    defaultOrderType: 'delivery',
    locked: false,
  },
  delivery: {
    context: 'delivery',
    surface: 'home',
    label: 'Delivery',
    icon: 'i-lucide-bike',
    visibleOrderTypes: ['delivery'],
    defaultOrderType: 'delivery',
    locked: true,
  },
  collection: {
    context: 'collection',
    surface: 'home',
    label: 'Collection',
    icon: 'i-lucide-shopping-bag',
    visibleOrderTypes: ['collection'],
    defaultOrderType: 'collection',
    locked: true,
  },
  table: {
    context: 'table',
    surface: 'dine_in',
    label: 'Table service',
    icon: 'i-lucide-utensils',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  kiosk: {
    context: 'kiosk',
    surface: 'kiosk',
    label: 'Kiosk',
    icon: 'i-lucide-monitor',
    visibleOrderTypes: ['eat_in', 'takeaway'],
    defaultOrderType: 'eat_in',
    locked: false,
  },
  staff_pos: {
    context: 'staff_pos',
    surface: 'staff_pos',
    label: 'Staff POS',
    icon: 'i-lucide-monitor',
    visibleOrderTypes: ['dine_in', 'eat_in', 'takeaway'],
    defaultOrderType: 'eat_in',
    locked: false,
  },
  dine_in: {
    context: 'dine_in',
    surface: 'dine_in',
    label: 'Table service',
    icon: 'i-lucide-utensils',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  pre_order: {
    context: 'pre_order',
    surface: 'pre_order',
    label: 'Pre-order',
    icon: 'i-lucide-calendar-clock',
    visibleOrderTypes: ['pre_order'],
    defaultOrderType: 'pre_order',
    locked: true,
  },
  room_service: {
    context: 'room_service',
    surface: 'room_service',
    label: 'Room service',
    icon: 'i-lucide-concierge-bell',
    visibleOrderTypes: ['room_service'],
    defaultOrderType: 'room_service',
    locked: true,
  },
}

export const publicMenuSurfaceProfiles = [
  profiles.home,
  profiles.dine_in,
  profiles.kiosk,
  profiles.pre_order,
  profiles.room_service,
] as const

export function normalizeMenuRouteContext(value: unknown): MenuRouteContext {
  const context = text(value)

  return contextSet.has(context) ? context as MenuRouteContext : 'generic'
}

export function menuContextProfile(value: unknown): MenuContextProfile {
  return profiles[normalizeMenuRouteContext(value)]
}

export function menuOrderChannelForContext(
  value: unknown
): KitchenOrderChannel {
  const surface = menuContextProfile(value).surface
  if (surface === 'dine_in') return 'table_qr'
  if (surface === 'kiosk') return 'kiosk'
  if (surface === 'room_service') return 'room_service'
  if (surface === 'staff_pos') return 'staff_pos'

  return 'menu'
}

export const menuContextualMenuId = (
  menuId: unknown,
  context: MenuRouteContext
) => {
  const id = text(menuId)

  return !id || context === 'generic' ? id : `${id}.${context}`
}

export function menuChoiceContextForOrderType(
  type: KitchenOrderType
): MenuRouteContext {
  if (type === 'delivery') return 'delivery'
  if (type === 'collection') return 'collection'
  if (type === 'eat_in' || type === 'takeaway') return 'kiosk'
  if (type === 'dine_in') return 'dine_in'
  if (type === 'pre_order') return 'pre_order'
  if (type === 'room_service') return 'room_service'

  return 'generic'
}

export function parseMenuRouteTarget(value: unknown): MenuRouteTarget {
  const rawMenuId = text(value)
  const [contextCandidate, ...menuParts] = rawMenuId
    .split('.')
    .reverse()
  const hasContextSuffix = contextSet.has(text(contextCandidate)) && menuParts.length

  if (!hasContextSuffix) {
    return {
      menuId: rawMenuId,
      context: 'generic',
    }
  }

  return {
    menuId: menuParts.reverse().join('.'),
    context: normalizeMenuRouteContext(contextCandidate),
  }
}
