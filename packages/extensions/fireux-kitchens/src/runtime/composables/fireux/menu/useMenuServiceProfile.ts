import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuPublicChoice,
  MenuServiceProfile,
  MenuView,
} from '../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../models/order.model'
import { readMenuOrderTypeConfig } from '../../../utils/menu-ordering-policy'

type MenuServiceProfileSource = {
  ordering?: unknown
  public_choices?: unknown[]
  public_views?: unknown[]
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

const orderType = (value: unknown): KitchenOrderType | null => {
  const mode = text(value) as KitchenOrderType

  return orderTypes.includes(mode) ? mode : null
}

const defaultOrderType = (types: KitchenOrderType[]) =>
  types.includes('dine_in') ? 'dine_in' : types[0] || 'dine_in'

const orderingType = (value: unknown): MenuOrderTypeConfig | null => {
  const row = record(value)
  const normalized = readMenuOrderTypeConfig(row)

  if (!normalized) return null

  return {
    ...normalized,
    ...(text(row.message) ? { message: text(row.message) } : {}),
  }
}

const orderingConfig = (source: MenuServiceProfileSource): MenuOrderingConfig => {
  const ordering = record(source?.ordering)
  const configuredOrderTypes = list(ordering.order_types)
    .map(orderingType)
    .filter((type): type is MenuOrderTypeConfig => Boolean(type))

  if (configuredOrderTypes.length) {
    return {
      enabled: ordering.enabled === true,
      order_types: configuredOrderTypes,
    }
  }

  return {
    enabled: false,
    order_types: [],
  }
}

const publicChoice = (value: unknown): MenuPublicChoice | null => {
  const row = record(value)
  const choiceValue = text(row.value)
  const label = text(row.label)
  const view = menuView(row.view)
  const menuId = text(row.menu_id)
  const to = text(row.to)
  const type = orderType(row.order_type)
  const message = text(row.message)

  if (
    !choiceValue ||
    !label ||
    !menuId ||
    !menuViews.includes(view as MenuView)
  ) {
    return null
  }

  return {
    value: choiceValue,
    label,
    view: view as MenuView,
    menu_id: menuId,
    ...(to ? { to } : {}),
    ...(type ? { order_type: type } : {}),
    ...(message ? { message } : {}),
  }
}

const publicChoices = (value: unknown): MenuPublicChoice[] =>
  list(value)
    .map(publicChoice)
    .filter((choice): choice is MenuPublicChoice => Boolean(choice))

// Menu service profile spine: docs/concepts/family-menu.md. Keep menu service capability separate from whether ordering is enabled today.
export function resolveMenuServiceProfile(
  source: MenuServiceProfileSource
): MenuServiceProfile {
  const ordering = orderingConfig(source)
  const orderTypes = unique(ordering.order_types.map((type) => type.type))
  const defaultType = defaultOrderType(orderTypes)

  return {
    views: menuViewList(source?.public_views ?? source?.views),
    ordering,
    orderingEnabled: ordering.enabled && orderTypes.length > 0,
    orderTypes,
    defaultOrderType: defaultType,
    defaultOrderTypeConfig:
      ordering.order_types.find((type) => type.type === defaultType) ||
      ordering.order_types[0],
    publicChoices: publicChoices(source?.public_choices),
  }
}
