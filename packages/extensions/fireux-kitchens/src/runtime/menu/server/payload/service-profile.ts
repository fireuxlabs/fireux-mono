import type { KitchenOrderType } from '../../../kitchen/utils/order'
import type {
  MenuChoice,
  MenuOrderTypeConfig,
} from '../../models/menu-ordering.model'
import {
  readKitchenMenuOrdering,
  isMenuOrderingEnabled,
} from '../ordering/config'
import {
  menuContextProfile,
  normalizeMenuRouteContext,
} from '../../utils/menu-context'
import type { MenuPayloadScope } from './types'
const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)
const defaultOrderType = (types: KitchenOrderType[], contextValue: unknown) => {
  if (!types.length) return undefined

  const profile = menuContextProfile(contextValue)
  const preferred = profile.defaultOrderType
  const visibleTypes = profile.visibleOrderTypes.filter((type) =>
    types.includes(type)
  )

  if (preferred && visibleTypes.includes(preferred)) return preferred

  return (
    visibleTypes[0] ||
    (profile.context !== 'generic'
      ? preferred || profile.visibleOrderTypes[0]
      : types[0]) ||
    'dine_in'
  )
}

const contextOrderTypeConfigs = (
  ordering: ReturnType<typeof readKitchenMenuOrdering>,
  contextValue: unknown
) => {
  const profile = menuContextProfile(contextValue)

  return ordering.order_types
    .filter((type) => profile.visibleOrderTypes.includes(type.type))
    .map(publicOrderTypeConfig)
}

const publicOrderTypeConfig = (config: MenuOrderTypeConfig) => {
  const result = { ...config }
  delete result.notifications

  return result
}

const contextChoices = (choices: MenuChoice[], contextValue: unknown) => {
  const profile = menuContextProfile(contextValue)

  return choices.filter(
    (choice) =>
      choice.order_type &&
      (profile.context === 'generic' ||
        profile.visibleOrderTypes.includes(choice.order_type))
  )
}

export const menuServiceProfile = (scope: MenuPayloadScope) => {
  const ordering = readKitchenMenuOrdering(
    scope.kitchen_ordering,
    scope.kitchenMenuId || '',
    scope.fulfilment,
    scope.kitchen_operation_hours
  )
  const context = normalizeMenuRouteContext(scope.menuContext)
  const orderTypeConfigs = contextOrderTypeConfigs(ordering, context)
  const availableOrderTypes = unique(
    ordering.order_types.map((type) => type.type)
  )
  const orderTypes = unique(orderTypeConfigs.map((type) => type.type))
  const contextOrdering = {
    ...ordering,
    enabled: ordering.enabled && orderTypeConfigs.length > 0,
    order_types: orderTypeConfigs,
    ...(context === 'generic'
      ? {}
      : {
          service_hours: orderTypeConfigs[0]?.service_hours,
        }),
  }
  const defaultType = defaultOrderType(orderTypes, context)
  const choices = Array.isArray(scope.choices)
    ? (scope.choices as MenuChoice[])
    : []

  return {
    context,
    surface: menuContextProfile(context).surface,
    ordering: contextOrdering,
    orderingEnabled: isMenuOrderingEnabled(contextOrdering),
    orderTypes,
    availableOrderTypes,
    ...(defaultType
      ? {
          defaultOrderType: defaultType,
          defaultOrderTypeConfig: contextOrdering.order_types.find(
            (type: MenuOrderTypeConfig) => type.type === defaultType
          ),
        }
      : {}),
    choices: contextChoices(choices, context),
  }
}
