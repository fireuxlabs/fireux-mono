import { computed, toValue } from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import { menuOrderTypeLabel } from '../../../../../menu/utils/menu-ordering-ui'
import {
  guestMenuSurfaceOptions,
  menuContextProfile,
  menuOrderChannelForContext,
  normalizeMenuRouteContext,
} from '../../../../../menu/utils/menu-context'
import type { KitchenOrderType } from '../../../../utils/order.ts'
import type { MenuChoice } from '../../../../../menu/utils/menu.ts'
import { text } from './order-input'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
  MenuSurfaceOption,
  UseKitchenOrderFunnelOptions,
} from './types'

const supportedOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]

const defaultMenuChoice = (): MenuChoiceOption => ({
  value: 'menu',
  label: 'Menu',
})

const orderChoiceValue = (type: KitchenOrderType): MenuChoiceValue =>
  `order:${type}`

const orderType = (value: unknown): KitchenOrderType | undefined =>
  supportedOrderTypes.includes(value as KitchenOrderType)
    ? (value as KitchenOrderType)
    : undefined

const orderTypeIndex = (
  visibleOrderTypes: KitchenOrderType[],
  option: MenuChoiceOption
) => (option.orderType ? visibleOrderTypes.indexOf(option.orderType) : -1)

const menuChoiceOption = (choice: MenuChoice): MenuChoiceOption | null => {
  const type = orderType(choice.order_type)
  if (!choice.value || !choice.label) return null

  return {
    value: choice.value,
    label: choice.label,
    ...(choice.menu_id ? { menuId: choice.menu_id } : {}),
    ...(choice.to ? { to: choice.to } : {}),
    ...(type ? { orderType: type } : {}),
    ...(choice.message ? { message: choice.message } : {}),
  }
}

export function useMenuChoiceState(options: UseKitchenOrderFunnelOptions) {
  const behaviour = computed(() => toValue(options.menu)?.behaviour)
  const menuContext = computed(() =>
    normalizeMenuRouteContext(
      toValue(options.menuContext) || behaviour.value?.context
    )
  )
  const contextProfile = computed(() => menuContextProfile(menuContext.value))
  const orderChannel = computed(() =>
    menuOrderChannelForContext(menuContext.value)
  )
  const visibleOrderTypes = computed(
    () => contextProfile.value.visibleOrderTypes
  )
  const menuId = computed(() => text(toValue(options.menuId)))
  const sourceMenuId = computed(
    () => text(toValue(options.sourceMenuId)) || menuId.value
  )
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const menuRouteScope = computed(() => toValue(options.menuRouteScope))
  const sessionKitchenSlug = computed(
    () => text(toValue(options.sessionKitchenSlug)) || kitchenSlug.value
  )
  const menuStorageScope = computed(() => {
    const slug = sessionKitchenSlug.value
    const id = text(toValue(options.menuId))
    const scope = slug ? `${slug}:${id}` : id

    return [scope, menuContext.value].filter(Boolean).join(':')
  })
  const orderTypes = computed<KitchenOrderType[]>(() =>
    Array.isArray(behaviour.value?.orderTypes) ? behaviour.value.orderTypes : []
  )
  const availableMenuOrderTypes = computed<KitchenOrderType[]>(() =>
    Array.isArray(behaviour.value?.availableOrderTypes)
      ? behaviour.value.availableOrderTypes
      : orderTypes.value
  )
  const availableOrderTypes = computed<KitchenOrderType[]>(() =>
    visibleOrderTypes.value.filter((type) => orderTypes.value.includes(type))
  )
  const defaultOrderType = computed<KitchenOrderType>(() => {
    const preferred = contextProfile.value.defaultOrderType
    if (preferred && orderTypes.value.includes(preferred)) return preferred

    return availableOrderTypes.value[0] || orderTypes.value[0] || 'dine_in'
  })
  const orderTypeConfigs = computed(() => {
    const rows = behaviour.value?.ordering?.order_types

    return Array.isArray(rows) ? rows : []
  })
  const canOrder = computed(() =>
    Boolean(
      behaviour.value?.orderingEnabled && availableOrderTypes.value.length
    )
  )
  const isVisibleChoice = (option: MenuChoiceOption) =>
    option.orderType
      ? visibleOrderTypes.value.includes(option.orderType) &&
        (Boolean(option.to) ||
          availableOrderTypes.value.includes(option.orderType))
      : menuContext.value === 'generic'
  const sortChoiceOptions = (options: MenuChoiceOption[]) =>
    [...options].sort(
      (left, right) =>
        orderTypeIndex(visibleOrderTypes.value, left) -
        orderTypeIndex(visibleOrderTypes.value, right)
    )
  const generatedChoiceOptions = computed<MenuChoiceOption[]>(() => {
    if (!canOrder.value) return [defaultMenuChoice()]

    const choices = availableOrderTypes.value.map((type) => {
      const config = orderTypeConfigs.value.find((row) => row.type === type)

      return {
        value: orderChoiceValue(type),
        label: menuOrderTypeLabel(type),
        orderType: type,
        ...(config?.message ? { message: config.message } : {}),
      }
    })

    return choices.length ? choices : [defaultMenuChoice()]
  })
  const menuChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const choices = Array.isArray(behaviour.value?.choices)
      ? behaviour.value.choices
          .map(menuChoiceOption)
          .filter((choice): choice is MenuChoiceOption => Boolean(choice))
      : []
    const visibleChoices = sortChoiceOptions(choices.filter(isVisibleChoice))

    return visibleChoices.length > 1 &&
      visibleChoices.some((choice) => !choice.to)
      ? visibleChoices
      : []
  })
  const choiceOptions = computed<MenuChoiceOption[]>(() => {
    const choices = sortChoiceOptions(
      (menuChoiceOptions.value.length
        ? menuChoiceOptions.value
        : generatedChoiceOptions.value
      ).filter(isVisibleChoice)
    )

    return choices.length ? choices : [defaultMenuChoice()]
  })
  const localChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const local = sortChoiceOptions(
      choiceOptions.value.filter(
        (option) => !option.to && isVisibleChoice(option)
      )
    )
    const generated = sortChoiceOptions(
      generatedChoiceOptions.value.filter(isVisibleChoice)
    )

    return local.length
      ? local
      : generated.length
        ? generated
        : [defaultMenuChoice()]
  })
  const choiceValues = computed<MenuChoiceValue[]>(() =>
    localChoiceOptions.value.map((option) => option.value)
  )
  const preferredChoice = computed<MenuChoiceValue>(() => {
    const preferred = contextProfile.value.defaultOrderType
      ? localChoiceOptions.value.find(
          (option) => option.orderType === contextProfile.value.defaultOrderType
        )
      : undefined

    return (
      preferred?.value || choiceValues.value[0] || defaultMenuChoice().value
    )
  })
  const { selected: selectedChoice } = useStoredChoice<MenuChoiceValue>({
    key: computed(() => `fireux:menu:${menuStorageScope.value}:choice`),
    choices: choiceValues,
    fallback: preferredChoice,
  })
  const selectedChoiceOption = computed<MenuChoiceOption>(
    () =>
      localChoiceOptions.value.find(
        (option) => option.value === selectedChoice.value
      ) ||
      localChoiceOptions.value[0] ||
      defaultMenuChoice()
  )
  const selectedOrderType = computed<KitchenOrderType>(
    () => selectedChoiceOption.value.orderType || 'dine_in'
  )
  const selectedOrderTypeConfig = computed(
    () =>
      orderTypeConfigs.value.find(
        (type) => type.type === selectedOrderType.value
      ) ||
      orderTypeConfigs.value.find(
        (type) => type.type === defaultOrderType.value
      ) ||
      orderTypeConfigs.value[0]
  )
  const surfaceOptions = computed<MenuSurfaceOption[]>(() => {
    return guestMenuSurfaceOptions({
      behaviour: behaviour.value,
      menuId: menuId.value,
      routeScope: menuRouteScope.value,
      activeContext: menuContext.value,
    })
  })

  function setSelectedChoice(value: MenuChoiceValue) {
    selectedChoice.value = value
  }

  function selectOrderType(type: KitchenOrderType) {
    const choice = localChoiceOptions.value.find(
      (option) => option.orderType === type
    )
    if (!choice) return false

    selectedChoice.value = choice.value
    return true
  }

  return {
    availableMenuOrderTypes,
    availableOrderTypes,
    behaviour,
    canOrder,
    choiceOptions,
    contextProfile,
    defaultOrderType,
    kitchenSlug,
    localChoiceOptions,
    menuContext,
    menuId,
    menuRouteScope,
    menuStorageScope,
    orderChannel,
    orderTypeConfigs,
    orderTypes,
    selectedChoice,
    selectedChoiceOption,
    selectedOrderType,
    selectedOrderTypeConfig,
    sessionKitchenSlug,
    setSelectedChoice,
    selectOrderType,
    sourceMenuId,
    surfaceLabel: computed(() => contextProfile.value.label),
    surfaceOptions,
    visibleOrderTypes,
  }
}
