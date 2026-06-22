import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuView } from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'

type MenuViewSource = {
  orderingEnabled?: boolean
  orderingModes?: KitchenOrderType[]
  views?: MenuView[]
} | null | undefined

const supportedViews = ['browse', 'order'] as const

export function useMenuView(
  source: MaybeRefOrGetter<MenuViewSource>
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
  const viewModes = computed<MenuView[]>(() => {
    const menu = toValue(source)
    const configured = Array.isArray(menu?.views) ? menu.views : []
    const fallback: MenuView[] = canOrder.value
      ? ['browse', 'order']
      : ['browse']
    const modes = configured.length ? configured : fallback
    const supported = modes.filter((mode) =>
      supportedViews.includes(mode as typeof supportedViews[number])
    )
    const available = supported.filter((mode) =>
      mode === 'browse' || canOrder.value
    )

    return available.length ? available : ['browse']
  })
  const viewMode = ref<MenuView>('browse')
  const isOrderMode = computed(() =>
    canOrder.value &&
      viewModes.value.includes('order') &&
      viewMode.value === 'order'
  )
  const orderNotice = computed(() => {
    if (defaultOrderType.value !== 'pre_order') return ''

    return 'For normal service, please order at the bar or at your table. This menu is for pre-orders only.'
  })

  watch(
    viewModes,
    (modes) => {
      if (!modes.includes(viewMode.value)) {
        viewMode.value = modes[0] || 'browse'
      }
    },
    { immediate: true }
  )

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
