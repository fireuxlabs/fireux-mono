import {
  computed,
  toValue,
} from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import { menuOrderTypeLabel } from '../../../../../../utils/menu-ordering-ui'
import {
  menuContextualMenuId,
  menuContextProfile,
  menuOrderChannelForContext,
  normalizeMenuRouteContext,
  publicMenuSurfaceProfiles,
} from '../../../../../../utils/menu-context'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import type { MenuRouteContext } from '../../../../../../models/kitchen/menu/menu-context.model'
import type { MenuChoice } from '../../../../../../models/kitchen/menu/menu.model'
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
    ? value as KitchenOrderType
    : undefined

const orderTypeIndex = (
  visibleOrderTypes: KitchenOrderType[],
  option: MenuChoiceOption
) => option.orderType ? visibleOrderTypes.indexOf(option.orderType) : -1

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

const contextualMenuPath = (
  menuId: string,
  kitchenSlug: string,
  context: MenuRouteContext
) => {
  const contextualMenuId = context === 'generic'
    ? menuId
    : menuContextualMenuId(menuId, context)

  return kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(contextualMenuId)}`
    : `/menus/${encodeURIComponent(contextualMenuId)}`
}

export function useMenuChoiceState(options: UseKitchenOrderFunnelOptions) {
  const behaviour = computed(() => toValue(options.menu)?.behaviour)
  const menuContext = computed(() =>
    normalizeMenuRouteContext(toValue(options.menuContext) || behaviour.value?.context)
  )
  const contextProfile = computed(() => menuContextProfile(menuContext.value))
  const orderChannel = computed(() =>
    menuOrderChannelForContext(menuContext.value)
  )
  const visibleOrderTypes = computed(() => contextProfile.value.visibleOrderTypes)
  const menuId = computed(() => text(toValue(options.menuId)))
  const sourceMenuId = computed(() =>
    text(toValue(options.sourceMenuId)) || menuId.value
  )
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const sessionKitchenSlug = computed(() =>
    text(toValue(options.sessionKitchenSlug)) || kitchenSlug.value
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
    Boolean(behaviour.value?.orderingEnabled && availableOrderTypes.value.length)
  )
  const isVisibleChoice = (option: MenuChoiceOption) =>
    option.orderType
      ? visibleOrderTypes.value.includes(option.orderType) &&
        (Boolean(option.to) || availableOrderTypes.value.includes(option.orderType))
      : menuContext.value === 'generic'
  const sortChoiceOptions = (options: MenuChoiceOption[]) =>
    [...options].sort((left, right) =>
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

    return visibleChoices.length > 1 && visibleChoices.some((choice) => !choice.to)
      ? visibleChoices
      : []
  })
  const choiceOptions = computed<MenuChoiceOption[]>(() => {
    const choices = sortChoiceOptions((menuChoiceOptions.value.length
      ? menuChoiceOptions.value
      : generatedChoiceOptions.value).filter(isVisibleChoice))

    return choices.length ? choices : [defaultMenuChoice()]
  })
  const localChoiceOptions = computed<MenuChoiceOption[]>(() => {
    const local = sortChoiceOptions(
      choiceOptions.value.filter((option) => !option.to && isVisibleChoice(option))
    )
    const generated = sortChoiceOptions(
      generatedChoiceOptions.value.filter(isVisibleChoice)
    )

    return local.length ? local : generated.length ? generated : [defaultMenuChoice()]
  })
  const choiceValues = computed<MenuChoiceValue[]>(() =>
    localChoiceOptions.value.map((option) => option.value)
  )
  const preferredChoice = computed<MenuChoiceValue>(() => {
    const preferred = contextProfile.value.defaultOrderType
      ? localChoiceOptions.value.find((option) =>
          option.orderType === contextProfile.value.defaultOrderType
        )
      : undefined

    return preferred?.value || choiceValues.value[0] || defaultMenuChoice().value
  })
  const { selected: selectedChoice } = useStoredChoice<MenuChoiceValue>({
    key: computed(() => `fireux:menu:${menuStorageScope.value}:choice`),
    choices: choiceValues,
    fallback: preferredChoice,
  })
  const selectedChoiceOption = computed<MenuChoiceOption>(() =>
    localChoiceOptions.value.find((option) => option.value === selectedChoice.value) ||
    localChoiceOptions.value[0] ||
    defaultMenuChoice()
  )
  const selectedOrderType = computed<KitchenOrderType>(() =>
    selectedChoiceOption.value.orderType || 'dine_in'
  )
  const selectedOrderTypeConfig = computed(() =>
    orderTypeConfigs.value.find((type) => type.type === selectedOrderType.value) ||
    orderTypeConfigs.value.find((type) => type.type === defaultOrderType.value) ||
    orderTypeConfigs.value[0]
  )
  const surfaceOptions = computed<MenuSurfaceOption[]>(() => {
    if (!menuId.value) return []

    const choices = Array.isArray(behaviour.value?.choices)
      ? behaviour.value.choices
          .map(menuChoiceOption)
          .filter((choice): choice is MenuChoiceOption => Boolean(choice))
      : []
    const surfaceOrderTypes = Array.from(new Set([
      ...availableMenuOrderTypes.value,
      ...choices
        .map((choice) => choice.orderType)
        .filter((type): type is KitchenOrderType => Boolean(type)),
    ]))
    const surfaces = publicMenuSurfaceProfiles.filter((surface) =>
      surface.visibleOrderTypes.some((type) => surfaceOrderTypes.includes(type))
    )

    return surfaces.map((surface) => {
      const hasLocalOrderType = surface.visibleOrderTypes.some((type) =>
        availableMenuOrderTypes.value.includes(type)
      )
      const linkedChoice = choices.find((choice) =>
        Boolean(choice.to) &&
        Boolean(choice.menuId) &&
        Boolean(choice.orderType) &&
        surface.visibleOrderTypes.includes(choice.orderType as KitchenOrderType)
      )
      const linkedMarker = '/menus/'
      const linkedIndex = linkedChoice?.to?.indexOf(linkedMarker) ?? -1
      const linkedSurfacePath =
        linkedChoice?.to && linkedChoice.menuId && linkedIndex >= 0
          ? `${linkedChoice.to.slice(0, linkedIndex + linkedMarker.length)}${encodeURIComponent(menuContextualMenuId(linkedChoice.menuId, surface.context))}`
          : linkedChoice?.to || ''

      return {
        value: surface.context,
        label: surface.label,
        to: hasLocalOrderType
          ? contextualMenuPath(menuId.value, kitchenSlug.value, surface.context)
          : linkedSurfacePath,
        active: contextProfile.value.surface === surface.surface,
      }
    }).filter((surface) => Boolean(surface.to))
  })

  function setSelectedChoice(value: MenuChoiceValue) {
    selectedChoice.value = value
  }

  function selectOrderType(type: KitchenOrderType) {
    const choice = localChoiceOptions.value.find((option) =>
      option.orderType === type
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
