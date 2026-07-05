import type { KitchenOrderType } from '../models/kitchen/order.model'
import {
  MenuRouteContexts,
  type MenuRouteContext,
} from '../models/kitchen/menu/menu-context.model'

export type MenuContextProfile = {
  context: MenuRouteContext
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
    visibleOrderTypes: [
      'dine_in',
      'take_away',
      'pre_order',
      'room_service',
      'collection',
      'delivery',
    ],
    defaultOrderType: 'dine_in',
    locked: false,
  },
  dine_in: {
    context: 'dine_in',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  collection: {
    context: 'collection',
    visibleOrderTypes: ['collection'],
    defaultOrderType: 'collection',
    locked: true,
  },
  delivery: {
    context: 'delivery',
    visibleOrderTypes: ['delivery'],
    defaultOrderType: 'delivery',
    locked: true,
  },
  pre_order: {
    context: 'pre_order',
    visibleOrderTypes: ['pre_order'],
    defaultOrderType: 'pre_order',
    locked: true,
  },
  room_service: {
    context: 'room_service',
    visibleOrderTypes: ['room_service'],
    defaultOrderType: 'room_service',
    locked: true,
  },
  from_home: {
    context: 'from_home',
    visibleOrderTypes: ['delivery', 'collection'],
    defaultOrderType: 'delivery',
    locked: false,
  },
  in_store: {
    context: 'in_store',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  kiosk: {
    context: 'kiosk',
    visibleOrderTypes: ['dine_in', 'take_away'],
    defaultOrderType: 'dine_in',
    locked: false,
  },
  from_table: {
    context: 'from_table',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  from_room: {
    context: 'from_room',
    visibleOrderTypes: ['room_service'],
    defaultOrderType: 'room_service',
    locked: true,
  },
}

export function normalizeMenuRouteContext(value: unknown): MenuRouteContext {
  const context = text(value)

  return contextSet.has(context) ? context as MenuRouteContext : 'generic'
}

export function menuContextProfile(value: unknown): MenuContextProfile {
  return profiles[normalizeMenuRouteContext(value)]
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
