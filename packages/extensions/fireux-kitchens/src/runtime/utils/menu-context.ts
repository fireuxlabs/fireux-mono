import type {
  FulfilmentMode,
  KitchenOrderType,
} from '../models/kitchen/order.model'
import {
  MenuRouteContexts,
  type MenuRouteContext,
  type OrderingSurface,
} from '../models/kitchen/menu/menu-context.model'

export type MenuContextProfile = {
  context: MenuRouteContext
  surface?: OrderingSurface
  fulfilmentModes?: FulfilmentMode[]
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
      'eat_in',
      'takeaway',
      'collection',
      'delivery',
      'pre_order',
      'room_service',
    ],
    defaultOrderType: 'delivery',
    locked: false,
  },
  home: {
    context: 'home',
    surface: 'homeDelivery',
    fulfilmentModes: ['delivery', 'collection'],
    visibleOrderTypes: ['delivery', 'collection'],
    defaultOrderType: 'delivery',
    locked: false,
  },
  table: {
    context: 'table',
    surface: 'tableQr',
    fulfilmentModes: ['dineIn'],
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  kiosk: {
    context: 'kiosk',
    surface: 'kiosk',
    fulfilmentModes: ['eatIn', 'takeaway'],
    visibleOrderTypes: ['eat_in', 'takeaway'],
    defaultOrderType: 'eat_in',
    locked: false,
  },
  dine_in: {
    context: 'dine_in',
    visibleOrderTypes: ['dine_in'],
    defaultOrderType: 'dine_in',
    locked: true,
  },
  eat_in: {
    context: 'eat_in',
    visibleOrderTypes: ['eat_in'],
    defaultOrderType: 'eat_in',
    locked: true,
  },
  takeaway: {
    context: 'takeaway',
    visibleOrderTypes: ['takeaway'],
    defaultOrderType: 'takeaway',
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
