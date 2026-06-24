import type {
  MenuOrderingConfig,
  MenuOrderingModeConfig,
  MenuServiceProfile,
  MenuView,
} from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'

type MenuServiceProfileSource = {
  ordering?: unknown
  ordering_enabled?: boolean
  ordering_modes?: unknown[]
  public_views?: unknown[]
  service_modes?: unknown[]
  views?: unknown[]
} | null | undefined

const menuViews = ['browse', 'order'] as const satisfies readonly MenuView[]
const orderTypes = [
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => Array.isArray(value) ? value : []
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)

const menuView = (value: unknown) => {
  const view = text(value)
  if (view === 'classic' || view === 'read') return 'browse'
  return view
}

const menuViewList = (value: unknown): MenuView[] =>
  unique(
    list(value)
      .map(menuView)
      .filter((view): view is MenuView =>
        menuViews.includes(view as MenuView)
      )
  )

const orderTypeList = (value: unknown): KitchenOrderType[] =>
  unique(
    list(value)
      .map(text)
      .filter((mode): mode is KitchenOrderType =>
        orderTypes.includes(mode as KitchenOrderType)
      )
  )

const orderType = (value: unknown): KitchenOrderType | null => {
  const mode = text(value) as KitchenOrderType

  return orderTypes.includes(mode) ? mode : null
}

const defaultOrderType = (modes: KitchenOrderType[]) =>
  modes.includes('dine_in') ? 'dine_in' : modes[0] || 'dine_in'

const noticeHours = (value: unknown) => {
  const hours = Number(value)

  return Number.isFinite(hours) && hours > 0 ? hours : undefined
}

const orderingMode = (value: unknown): MenuOrderingModeConfig | null => {
  const row = record(value)
  const type = orderType(row.type)
  const serviceMode = orderType(row.service_mode)
  const notice = noticeHours(row.notice_hours)

  if (!type) return null

  return {
    type,
    ...(serviceMode ? { service_mode: serviceMode } : {}),
    ...(notice ? { notice_hours: notice } : {}),
  }
}

const orderingConfig = (source: MenuServiceProfileSource): MenuOrderingConfig => {
  const ordering = record(source?.ordering)
  const configuredModes = list(ordering.modes)
    .map(orderingMode)
    .filter((mode): mode is MenuOrderingModeConfig => Boolean(mode))

  if (configuredModes.length) {
    return {
      enabled: ordering.enabled === true,
      modes: configuredModes,
    }
  }

  const legacyServiceModes = orderTypeList(source?.service_modes)
  const legacyOrderingModes = orderTypeList(source?.ordering_modes)
  const legacyModes = legacyOrderingModes.length
    ? legacyOrderingModes
    : source?.ordering_enabled === true
      ? legacyServiceModes
      : []

  return {
    enabled: source?.ordering_enabled === true && legacyModes.length > 0,
    modes: legacyModes.map((type) => ({ type })),
  }
}

// Menu service profile spine: docs/concepts/family-menu.md. Keep menu service capability separate from whether ordering is enabled today.
export function resolveMenuServiceProfile(
  source: MenuServiceProfileSource
): MenuServiceProfile {
  const ordering = orderingConfig(source)
  const orderingModes = unique(ordering.modes.map((mode) => mode.type))
  const defaultType = defaultOrderType(orderingModes)

  return {
    views: menuViewList(source?.public_views ?? source?.views),
    ordering,
    orderingEnabled: ordering.enabled && orderingModes.length > 0,
    orderingModes,
    defaultOrderType: defaultType,
    defaultOrderingMode:
      ordering.modes.find((mode) => mode.type === defaultType) ||
      ordering.modes[0],
  }
}
