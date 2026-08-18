import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import {
  isKitchenOrderType,
  type KitchenOrderType,
} from '../../../../models/order.model.ts'
import type { MenuRouteContext } from '../../../../../menu/models/menu-context.model.ts'
import { menuOrderTypeLabel } from '../../../../../menu/utils/menu-ordering-ui'
import {
  menuChoiceContextForOrderType,
  menuContextProfile,
} from '../../../../../menu/utils/menu-context'
import {
  menuRoutePath,
  type MenuRouteScope,
} from '../../../../utils/kitchen-menu-route'

type StoredSessionLine = {
  id?: string
  lineId?: string
  menuId?: string
  name?: string
  quantity?: number
  unitPrice?: number
}

export type MenuOrderSessionSummary = {
  key: string
  orderType: KitchenOrderType
  label: string
  quantity: number
  menuIds: string[]
  firstMenuId: string
}
export type MenuOrderSessionConflict = {
  currentLabel: string
  label: string
  orderType: KitchenOrderType
  quantity: number
  to: string
}
type UseOrderSessionConflictOptions = {
  enabled: MaybeRefOrGetter<boolean>
  kitchenSlug: MaybeRefOrGetter<string | null | undefined>
  menuId: MaybeRefOrGetter<string | null | undefined>
  menuRouteScope: MaybeRefOrGetter<MenuRouteScope>
  orderType: MaybeRefOrGetter<KitchenOrderType>
  context?: MaybeRefOrGetter<MenuRouteContext | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()
const sessionStoragePrefix = 'fireux:order-session:'
const sessionChangeEvent = 'fireux:order-session-change'
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const readStoredLines = (value: unknown): StoredSessionLine[] =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.values(value as Record<string, unknown>)
        .filter((line): line is StoredSessionLine =>
          Boolean(line && typeof line === 'object' && !Array.isArray(line))
        )
    : []

const readStoredDraft = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const stored = value as Record<string, unknown>
  const expiresAt = Date.parse(text(stored.expiresAt))
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
    ? stored.items
    : null
}

export const orderSessionContextForOrderType = (
  orderType: KitchenOrderType
): MenuRouteContext => menuChoiceContextForOrderType(orderType)

export const orderSessionStorageScope = (input: {
  kitchenSlug?: unknown
  menuId?: unknown
}) => text(input.kitchenSlug) || `menu:${text(input.menuId)}`

const orderSessionMenuPath = (input: {
  context: MenuRouteContext
  menuId?: unknown
  routeScope: MenuRouteScope
}) => {
  const menuId = text(input.menuId)
  if (!menuId) return ''

  return menuRoutePath({
    scope: input.routeScope,
    menuId,
    context: input.context,
  })
}

export const orderSessionStorageKey = (input: {
  kitchenSlug?: unknown
  menuId?: unknown
  orderType?: unknown
}) => {
  const scope = orderSessionStorageScope(input)
  const orderType = text(input.orderType)
  if (!scope || !isKitchenOrderType(orderType)) return ''

  return `fireux:order-session:${scope}:${orderType}:order`
}

export const notifyOrderSessionChanged = () => {
  if (!import.meta.client) return

  window.dispatchEvent(new Event(sessionChangeEvent))
}

export const clearOrderSession = (key: unknown) => {
  const safeKey = text(key)
  if (
    !import.meta.client ||
    !safeKey.startsWith(sessionStoragePrefix) ||
    !safeKey.endsWith(':order')
  ) {
    return
  }

  window.localStorage.removeItem(safeKey)
  notifyOrderSessionChanged()
}

export const readOrderSessionSummaries = (
  kitchenSlug: unknown
): MenuOrderSessionSummary[] => {
  const scope = text(kitchenSlug)
  if (!import.meta.client || !scope) return []

  const prefix = `fireux:order-session:${scope}:`
  const sessions: MenuOrderSessionSummary[] = []

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) || ''
      if (!key.startsWith(prefix) || !key.endsWith(':order')) continue

      const orderType = key.slice(prefix.length, -':order'.length)
      if (!isKitchenOrderType(orderType)) continue

      const parsed = JSON.parse(window.localStorage.getItem(key) || 'null')
      const storedDraft = readStoredDraft(parsed)
      if (!storedDraft) {
        window.localStorage.removeItem(key)
        continue
      }
      const lines = readStoredLines(storedDraft)
      const quantity = lines.reduce(
        (total, line) => total + Math.max(0, numberValue(line.quantity)),
        0
      )
      if (!quantity) continue

      const menuIds = Array.from(new Set(
        lines.map((line) => text(line.menuId)).filter(Boolean)
      ))

      sessions.push({
        key,
        orderType,
        label: menuOrderTypeLabel(orderType),
        quantity,
        menuIds,
        firstMenuId: menuIds[0] || '',
      })
    }
  } catch {
    return []
  }

  return sessions.sort((left, right) =>
    left.label.localeCompare(right.label)
  )
}

export function useOrderSessionConflict(
  options: UseOrderSessionConflictOptions
) {
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const menuId = computed(() => text(toValue(options.menuId)))
  const menuRouteScope = computed(() => toValue(options.menuRouteScope))
  const orderType = computed(() => toValue(options.orderType))
  const currentContext = computed(() => toValue(options.context))
  const enabled = computed(() => toValue(options.enabled) === true)
  const summaries = useOrderSessionSummaries(kitchenSlug)
  const conflictingSession = computed<MenuOrderSessionSummary | null>(() =>
    summaries.sessions.value.find((session: MenuOrderSessionSummary) =>
      session.orderType !== orderType.value
    ) || null
  )
  const hasConflict = computed(() =>
    enabled.value && Boolean(conflictingSession.value)
  )
  const conflict = computed<MenuOrderSessionConflict | null>(() => {
    const session = conflictingSession.value
    if (!hasConflict.value || !session) return null

    const conflictMenuId = session.firstMenuId || menuId.value
    const profile = menuContextProfile(currentContext.value)
    const context = profile.visibleOrderTypes.includes(session.orderType)
      ? profile.context
      : orderSessionContextForOrderType(session.orderType)

    return {
      currentLabel: menuOrderTypeLabel(orderType.value),
      label: session.label,
      orderType: session.orderType,
      quantity: session.quantity,
      to: orderSessionMenuPath({
        context,
        menuId: conflictMenuId,
        routeScope: menuRouteScope.value,
      }),
    }
  })

  function restart() {
    const session = conflictingSession.value
    if (!session) return

    clearOrderSession(session.key)
    summaries.refresh()
  }

  return {
    conflict,
    hasConflict,
    refresh: summaries.refresh,
    restart,
  }
}

export function useOrderSessionSummaries(
  kitchenSlug: MaybeRefOrGetter<string | null | undefined>
) {
  const sessions = ref<MenuOrderSessionSummary[]>([])
  const slug = computed(() => text(toValue(kitchenSlug)))

  function refresh() {
    sessions.value = readOrderSessionSummaries(slug.value)
  }

  onMounted(() => {
    refresh()
    window.addEventListener(sessionChangeEvent, refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return

    window.removeEventListener(sessionChangeEvent, refresh)
    window.removeEventListener('focus', refresh)
    window.removeEventListener('storage', refresh)
  })

  return {
    refresh,
    sessions,
  }
}
