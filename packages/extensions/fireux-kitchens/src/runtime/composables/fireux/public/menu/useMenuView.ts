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
const uniqueMenuViews = (views: MenuView[]) =>
  views.filter((mode, index, modes) => modes.indexOf(mode) === index)

export function useMenuView(
  source: MaybeRefOrGetter<MenuViewSource>,
  storageKey?: MaybeRefOrGetter<string | null | undefined>
) {
  const key = computed(() => String(toValue(storageKey) || '').trim())
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
    // Public menu view spine: docs/concepts/family-menu.md. Browse is the base view; configured views only add supported extras.
    const configured: MenuView[] = Array.isArray(menu?.views)
      ? menu.views.filter((mode): mode is MenuView =>
          supportedViews.includes(mode as typeof supportedViews[number])
        )
      : []
    const supportedExtras = configured.filter((mode) => mode !== 'browse')
    const defaultExtras: MenuView[] = ['order']
    const available: MenuView[] = ['browse']
    if (canOrder.value) {
      available.push(...(supportedExtras.length ? supportedExtras : defaultExtras))
    }

    return uniqueMenuViews(available)
  })
  const viewMode = ref<MenuView>('browse')
  const storedViewMode = ref<MenuView | ''>('')
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
      if (storedViewMode.value && modes.includes(storedViewMode.value)) {
        viewMode.value = storedViewMode.value
        return
      }

      if (!modes.includes(viewMode.value)) {
        viewMode.value = modes[0] || 'browse'
      }
    },
    { immediate: true }
  )

  watch(
    key,
    (nextKey) => {
      if (!import.meta.client || !nextKey) return

      const stored = window.localStorage.getItem(nextKey)
      const storedMode = supportedViews.includes(stored as typeof supportedViews[number])
        ? stored as MenuView
        : ''
      storedViewMode.value = storedMode

      if (storedMode && viewModes.value.includes(storedMode)) {
        viewMode.value = storedMode
      }
    },
    { immediate: true }
  )

  watch(viewMode, (mode) => {
    if (!import.meta.client || !key.value) return
    window.localStorage.setItem(key.value, mode)
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
