import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuPublicChoice,
  MenuView,
} from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'
import { menuOrderTypeLabel } from '../../../../utils/menu-ordering-ui'

type MenuViewSource = {
  ordering?: MenuOrderingConfig
  orderingEnabled?: boolean
  orderTypes?: KitchenOrderType[]
  defaultOrderTypeConfig?: MenuOrderTypeConfig
  publicChoices?: MenuPublicChoice[]
  views?: MenuView[]
} | null | undefined

export type MenuChoiceValue = string

export type MenuChoiceOption = {
  value: MenuChoiceValue
  label: string
  view: MenuView
  menuId?: string
  to?: string
  orderType?: KitchenOrderType
  message?: string
}

const supportedViews = ['browse', 'order'] as const satisfies readonly MenuView[]
const supportedOrderTypes = [
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]
const browseChoice = (): MenuChoiceOption => ({
  value: 'browse',
  label: 'Browse',
  view: 'browse',
})
const uniqueMenuViews = (views: MenuView[]) =>
  views.filter((mode, index, modes) => modes.indexOf(mode) === index)
const orderChoiceValue = (type: KitchenOrderType): MenuChoiceValue =>
  `order:${type}`
const orderType = (value: unknown): KitchenOrderType | undefined =>
  supportedOrderTypes.includes(value as KitchenOrderType)
    ? value as KitchenOrderType
    : undefined

const publicChoiceOption = (choice: MenuPublicChoice): MenuChoiceOption | null => {
  const type = orderType(choice.order_type)

  if (
    !choice.value ||
    !choice.label ||
    !supportedViews.includes(choice.view)
  ) {
    return null
  }

  return {
    value: choice.value,
    label: choice.label,
    view: choice.view,
    ...(choice.menu_id ? { menuId: choice.menu_id } : {}),
    ...(choice.to ? { to: choice.to } : {}),
    ...(type ? { orderType: type } : {}),
    ...(choice.message ? { message: choice.message } : {}),
  }
}

export function useMenuViewMode(
  source: MaybeRefOrGetter<MenuViewSource>,
  storageKey?: MaybeRefOrGetter<string | null | undefined>
) {
  const orderTypes = computed<KitchenOrderType[]>(() => {
    const menu = toValue(source)

    return Array.isArray(menu?.orderTypes) ? menu.orderTypes : []
  })
  const defaultOrderType = computed<KitchenOrderType>(() => {
    if (orderTypes.value.includes('dine_in')) return 'dine_in'

    return orderTypes.value[0] || 'dine_in'
  })
  const defaultOrderTypeConfig = computed(() => {
    const menu = toValue(source)

    return menu?.defaultOrderTypeConfig
  })
  const orderTypeConfigs = computed<MenuOrderTypeConfig[]>(() => {
    const menu = toValue(source)
    const orderTypeRows = menu?.ordering?.order_types

    return Array.isArray(orderTypeRows) ? orderTypeRows : []
  })
  const canOrder = computed(() => {
    const menu = toValue(source)

    return Boolean(menu?.orderingEnabled && orderTypes.value.length)
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
  const generatedChoiceOptions = computed<MenuChoiceOption[]>(() => {
    // Public menu choice spine: browse and order types share one rail; delivery/collection are order types, not a second UI mode.
    const options: MenuChoiceOption[] = []
    if (viewModes.value.includes('browse')) {
      options.push(browseChoice())
    }
    if (canOrder.value && viewModes.value.includes('order')) {
      orderTypes.value.forEach((type) => {
        const config = orderTypeConfigs.value.find((row) => row.type === type)

        options.push({
          value: orderChoiceValue(type),
          label: menuOrderTypeLabel(type),
          view: 'order',
          orderType: type,
          ...(config?.message ? { message: config.message } : {}),
        })
      })
    }

    return options.length ? options : [browseChoice()]
  })
  const publicChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const menu = toValue(source)
    const choices = Array.isArray(menu?.publicChoices)
      ? menu.publicChoices
          .map(publicChoiceOption)
          .filter((choice): choice is MenuChoiceOption => Boolean(choice))
      : []

    // Use server-resolved choices only when they form a real rail for this route.
    return choices.length > 1 && choices.some((choice) => !choice.to)
      ? choices
      : []
  })
  const choiceOptions = computed<MenuChoiceOption[]>(() =>
    publicChoiceOptions.value.length
      ? publicChoiceOptions.value
      : generatedChoiceOptions.value
  )
  const localChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const local = choiceOptions.value.filter((option) => !option.to)

    return local.length ? local : generatedChoiceOptions.value
  })
  const choiceValues = computed<MenuChoiceValue[]>(() =>
    localChoiceOptions.value.map((option) => option.value)
  )
  const preferredChoice = computed<MenuChoiceValue>(() =>
    choiceValues.value[0] || 'browse'
  )
  const { selected: selectedChoice } = useStoredChoice<MenuChoiceValue>({
    key: storageKey,
    choices: choiceValues,
    fallback: preferredChoice,
  })
  const selectedChoiceOption = computed<MenuChoiceOption>(() =>
    localChoiceOptions.value.find((option) =>
      option.value === selectedChoice.value
    ) ||
    localChoiceOptions.value[0] ||
    browseChoice()
  )
  const viewMode = computed<MenuView>(() => selectedChoiceOption.value.view)
  const selectedOrderType = computed<KitchenOrderType>(() =>
    selectedChoiceOption.value.orderType || defaultOrderType.value
  )
  const isOrderMode = computed(() =>
    canOrder.value && viewMode.value === 'order'
  )
  const selectedOrderTypeConfig = computed(() =>
    orderTypeConfigs.value.find((type) => type.type === selectedOrderType.value) ||
    defaultOrderTypeConfig.value
  )
  const orderNotice = computed(() => {
    if (selectedOrderType.value !== 'pre_order') return ''
    if (selectedChoiceOption.value.message) {
      return selectedChoiceOption.value.message
    }

    const noticeHours = selectedOrderTypeConfig.value?.notice_hours
    if (noticeHours) {
      return `Pre-orders need at least ${noticeHours} hours notice.`
    }

    return ''
  })

  return {
    orderTypes,
    orderTypeConfigs,
    defaultOrderType,
    defaultOrderTypeConfig,
    choiceOptions,
    selectedChoice,
    selectedChoiceOption,
    selectedOrderType,
    selectedOrderTypeConfig,
    canOrder,
    viewModes,
    viewMode,
    isOrderMode,
    orderNotice,
  }
}
