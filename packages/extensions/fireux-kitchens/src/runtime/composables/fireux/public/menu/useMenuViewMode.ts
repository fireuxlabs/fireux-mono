import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import type {
  MenuOrderingModeConfig,
  MenuView,
} from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'

type MenuViewSource = {
  orderingEnabled?: boolean
  orderingModes?: KitchenOrderType[]
  defaultOrderingMode?: MenuOrderingModeConfig
  views?: MenuView[]
} | null | undefined

const supportedViews = ['browse', 'order'] as const
const uniqueMenuViews = (views: MenuView[]) =>
  views.filter((mode, index, modes) => modes.indexOf(mode) === index)

export function useMenuViewMode(
  source: MaybeRefOrGetter<MenuViewSource>,
  storageKey?: MaybeRefOrGetter<string | null | undefined>
) {
  const orderingModes = computed<KitchenOrderType[]>(() => {
    const menu = toValue(source)

    return Array.isArray(menu?.orderingModes) ? menu.orderingModes : []
  })
  const defaultOrderType = computed<KitchenOrderType>(() => {
    if (orderingModes.value.includes('dine_in')) return 'dine_in'

    return orderingModes.value[0] || 'dine_in'
  })
  const defaultOrderingMode = computed(() => {
    const menu = toValue(source)

    return menu?.defaultOrderingMode
  })
  const canOrder = computed(() => {
    const menu = toValue(source)

    return Boolean(menu?.orderingEnabled && orderingModes.value.length)
  })
  const configuredViews = computed<MenuView[]>(() => {
    const menu = toValue(source)

    return Array.isArray(menu?.views)
      ? menu.views.filter((mode): mode is MenuView =>
          supportedViews.includes(mode as typeof supportedViews[number])
        )
      : []
  })
  const viewModes = computed<MenuView[]>(() => {
    // Public menu view spine: docs/concepts/family-menu.md. Configured views are exact; empty falls back to browse plus order when available.
    const configured = configuredViews.value.filter((mode) =>
      mode === 'browse' || canOrder.value
    )
    const available: MenuView[] = configured.length
      ? configured
      : canOrder.value
        ? ['browse', 'order']
        : ['browse']

    return uniqueMenuViews(available)
  })
  const preferredViewMode = computed<MenuView>(() => {
    const modes = viewModes.value
    const configuredPreferred = configuredViews.value.find((mode) =>
      modes.includes(mode)
    )

    return configuredPreferred || modes[0] || 'browse'
  })
  const { selected: viewMode } = useStoredChoice<MenuView>({
    key: storageKey,
    choices: viewModes,
    fallback: preferredViewMode,
  })
  const isOrderMode = computed(() =>
    canOrder.value &&
      viewModes.value.includes('order') &&
      viewMode.value === 'order'
  )
  const orderNotice = computed(() => {
    const noticeHours = defaultOrderingMode.value?.notice_hours
    if (defaultOrderType.value !== 'pre_order') return ''
    if (noticeHours) {
      return `Pre-orders need at least ${noticeHours} hours notice. For normal service, please order at the bar or at your table.`
    }

    return 'For normal service, please order at the bar or at your table. This menu is for pre-orders only.'
  })

  return {
    orderingModes,
    defaultOrderType,
    defaultOrderingMode,
    canOrder,
    viewModes,
    viewMode,
    isOrderMode,
    orderNotice,
  }
}
