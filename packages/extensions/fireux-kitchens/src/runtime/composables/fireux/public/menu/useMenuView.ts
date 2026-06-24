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
  const viewMode = ref<MenuView>('browse')
  const storedViewMode = ref<MenuView | ''>('')
  const storageReady = ref(!import.meta.client)
  const initialViewResolved = ref(false)
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
    [viewModes, storedViewMode, preferredViewMode, storageReady],
    ([modes, stored]) => {
      if (!storageReady.value) return

      if (!initialViewResolved.value) {
        viewMode.value = stored && modes.includes(stored)
          ? stored
          : preferredViewMode.value
        initialViewResolved.value = true
        return
      }

      if (!modes.includes(viewMode.value)) {
        viewMode.value = stored && modes.includes(stored)
          ? stored
          : preferredViewMode.value
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
      initialViewResolved.value = false
      storageReady.value = true
    },
    { immediate: true }
  )

  watch(viewMode, (mode) => {
    if (!import.meta.client || !key.value) return
    storedViewMode.value = mode
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
