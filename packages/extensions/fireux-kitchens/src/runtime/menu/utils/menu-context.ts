import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../../kitchen/models/offering-interaction-types.model'
import {
  MenuRouteContexts,
  type MenuRouteContext,
  type MenuSurface,
} from '../models/menu-context.model.ts'
import type { MenuManifestBehaviour } from '../models/menu-detail.model.ts'
import type { MenuOrderingConfig } from '../models/menu-ordering.model'
import { menuRoutePath, type MenuRouteScope } from './menu-route'

export type MenuContextProfile = {
  context: MenuRouteContext
  surface: MenuSurface
  label: string
  icon: string
  visibleOrderTypes: KitchenOrderType[]
  defaultOrderType?: KitchenOrderType
  locked: boolean
}

const text = (value: unknown) => String(value ?? '').trim()
const contextSet = new Set<string>(MenuRouteContexts)

const profiles: Record<MenuRouteContext, MenuContextProfile> = {
  generic: {
    context: 'generic',
    surface: 'generic',
    label: 'Browse',
    icon: 'i-lucide-book-open',
    visibleOrderTypes: [],
    locked: false,
  },
  delivery: {
    context: 'delivery',
    surface: 'delivery',
    label: 'Delivery',
    icon: 'i-lucide-bike',
    visibleOrderTypes: ['delivery'],
    defaultOrderType: 'delivery',
    locked: true,
  },
  collection: {
    context: 'collection',
    surface: 'collection',
    label: 'Collection',
    icon: 'i-lucide-shopping-bag',
    visibleOrderTypes: ['collection'],
    defaultOrderType: 'collection',
    locked: true,
  },
  table: {
    context: 'table',
    surface: 'dine_in',
    label: 'QR table ordering',
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
    label: 'QR table ordering',
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
  profiles.delivery,
  profiles.collection,
  profiles.dine_in,
  profiles.kiosk,
  profiles.pre_order,
  profiles.room_service,
] as const

const privateEntryMenuContexts = new Set<MenuRouteContext>([
  'dine_in',
  'kiosk',
  'room_service',
])

export const guestDiscoverableMenuSurfaceProfiles =
  publicMenuSurfaceProfiles.filter(
    ({ context }) => !privateEntryMenuContexts.has(context)
  )

export function guestDiscoverableMenuContexts(
  ordering?: MenuOrderingConfig | null
): MenuRouteContext[] {
  if (!ordering?.enabled) return []

  const orderTypes = new Set(
    ordering.order_types
      .filter(
        (config) =>
          config.type !== 'dine_in' || config.table_channels?.table_qr !== false
      )
      .map(({ type }) => type)
  )

  return guestDiscoverableMenuSurfaceProfiles
    .filter(({ visibleOrderTypes }) =>
      visibleOrderTypes.some((type) => orderTypes.has(type))
    )
    .map(({ context }) => context)
}

export type GuestMenuSurfaceOption = {
  value: string
  label: string
  to: string
  active: boolean
}

export function guestMenuSurfaceOptions(options: {
  behaviour?: MenuManifestBehaviour | null
  menuId: string
  menuSlug: string
  routeScope: MenuRouteScope
  activeContext?: MenuRouteContext
  activeOfferingId?: string
}): GuestMenuSurfaceOption[] {
  const behaviour = options.behaviour
  const menuId = text(options.menuId)
  if (!behaviour || !menuId) return []

  const choices = Array.isArray(behaviour.choices) ? behaviour.choices : []
  const result: GuestMenuSurfaceOption[] = [
    {
      value: 'generic',
      label: 'Browse',
      to: menuRoutePath({
        scope: options.routeScope,
        menuId: options.menuSlug,
      }),
      active: options.activeContext === 'generic' && !options.activeOfferingId,
    },
  ]
  const seen = new Set<string>()
  for (const choice of choices) {
    if (choice.menu_id !== menuId || !choice.kitchen_offering_id || !choice.to)
      continue
    if (!choice.order_type) {
      result.push({
        value: choice.value,
        label: choice.label,
        to: choice.to,
        active:
          options.activeContext === 'generic' &&
          options.activeOfferingId === choice.kitchen_offering_id,
      })
      continue
    }
    const profile = guestDiscoverableMenuSurfaceProfiles.find((surface) =>
      surface.visibleOrderTypes.includes(choice.order_type!)
    )
    if (!profile) continue
    const key = `${choice.menu_id}:${choice.kitchen_offering_id}:${profile.context}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      value: key,
      label: `${choice.kitchen_offering_name} · ${profile.label}`,
      to: choice.to,
      active:
        options.activeContext === profile.context &&
        options.activeOfferingId === choice.kitchen_offering_id,
    })
  }
  return result
}

export function normalizeMenuRouteContext(value: unknown): MenuRouteContext {
  const context = text(value)

  return contextSet.has(context) ? (context as MenuRouteContext) : 'generic'
}

export function menuContextProfile(value: unknown): MenuContextProfile {
  return profiles[normalizeMenuRouteContext(value)]
}

export function menuManifestSupportsContext(
  behaviour: MenuManifestBehaviour | null | undefined,
  value: unknown
) {
  if (!behaviour) return false

  const profile = menuContextProfile(value)
  if (
    behaviour.context !== profile.context ||
    behaviour.surface !== profile.surface
  ) {
    return false
  }

  if (profile.context === 'generic') return true
  if (!behaviour.ordering.enabled || !behaviour.orderingEnabled) return false

  const configuredOrderTypes = new Set(
    behaviour.ordering.order_types.map(({ type }) => type)
  )

  return profile.visibleOrderTypes.some(
    (type) =>
      behaviour.orderTypes.includes(type) && configuredOrderTypes.has(type)
  )
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
