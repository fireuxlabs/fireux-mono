import type {
  MenuServiceMode,
  MenuServiceProfile,
  MenuView,
} from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'

type MenuServiceProfileSource = {
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

const defaultOrderType = (modes: KitchenOrderType[]) =>
  modes.includes('dine_in') ? 'dine_in' : modes[0] || 'dine_in'

// Menu service profile spine: docs/concepts/family-menu.md. Keep menu service capability separate from whether ordering is enabled today.
export function resolveMenuServiceProfile(
  source: MenuServiceProfileSource
): MenuServiceProfile {
  const serviceModes = orderTypeList(source?.service_modes)
  const explicitOrderingModes = orderTypeList(source?.ordering_modes)
  const orderingModes = explicitOrderingModes.length
    ? explicitOrderingModes
    : source?.ordering_enabled === true
      ? serviceModes
      : []

  return {
    views: menuViewList(source?.public_views ?? source?.views),
    serviceModes: serviceModes as MenuServiceMode[],
    orderingEnabled: source?.ordering_enabled === true && orderingModes.length > 0,
    orderingModes,
    defaultOrderType: defaultOrderType(orderingModes),
  }
}
