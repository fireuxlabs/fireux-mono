import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import type { MenuView } from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'

type MenuViewSource = {
  orderingEnabled?: boolean
  orderingModes?: KitchenOrderType[]
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
    // Public menu view spine: docs/concepts/family-menu.md. Browse is the base view; configured views only add supported extras.
    const supportedExtras = configuredViews.value.filter((mode) => mode !== 'browse')
    const defaultExtras: MenuView[] = ['order']
    const available: MenuView[] = ['browse']
    if (canOrder.value) {
      available.push(...(supportedExtras.length ? supportedExtras : defaultExtras))
    }

    return uniqueMenuViews(available)
  })
  const preferredViewMode = computed<MenuView>(() => {
    const modes = viewModes.value

    if (
      canOrder.value &&
      configuredViews.value.includes('order') &&
      !configuredViews.value.includes('browse') &&
      modes.includes('order')
    ) {
      return 'order'
    }

    return modes[0] || 'browse'
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
    if (defaultOrderType.value !== 'pre_order') return ''

    return 'For normal service, please order at the bar or at your table. This menu is for pre-orders only.'
  })

  return {
    orderingModes,
    defaultOrderType,
    canOrder,
    viewModes,
    viewMode,
    isOrderMode,
    orderNotice,
  }
}
