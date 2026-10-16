import type { KitchenOrderType } from '../../../kitchen/models/offering-interaction-types.model'
import { readKitchenPublicOfferings } from '../../../kitchen/utils/public-offerings'
import type {
  MenuChoice,
  MenuOrderTypeConfig,
} from '../../models/menu-ordering.model'
import {
  readKitchenMenuOrdering,
  isMenuOrderingEnabled,
} from '../offerings/projection'
import {
  menuContextProfile,
  normalizeMenuRouteContext,
} from '../../utils/menu-context'
import type { MenuPayloadScope } from './types'
import { publicMenuOrderTypes } from '../../utils/menu-ordering'
import { tableChannelEnabled } from '../../../kitchen/utils/table-service'
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
    .filter((type) =>
      tableChannelEnabled(
        type,
        profile.context === 'staff_pos' ? 'staff_pos' : 'table_qr'
      )
    )
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
      profile.context === 'generic' ||
      (choice.order_type &&
        profile.visibleOrderTypes.includes(choice.order_type))
  )
}

export const menuOfferingProfile = (scope: MenuPayloadScope) => {
  const ordering = readKitchenMenuOrdering(
    scope.kitchen_offerings,
    scope.kitchenMenuId || ''
  )
  const context = normalizeMenuRouteContext(scope.menuContext)
  const selectedOrdering = {
    ...ordering,
    order_types: ordering.order_types.filter(
      (config) =>
        context === 'generic' ||
        config.kitchen_offering_id === scope.kitchenOfferingId
    ),
  }
  const orderTypeConfigs = contextOrderTypeConfigs(selectedOrdering, context)
  const availableOrderTypes = unique(
    publicMenuOrderTypes(ordering)
      .map((type) => type.type)
  )
  const orderTypes = unique(orderTypeConfigs.map((type) => type.type))
  const contextOrdering = {
    ...ordering,
    enabled: ordering.enabled && orderTypeConfigs.length > 0,
    order_types: orderTypeConfigs,
    ...(context === 'generic'
      ? {}
      : {
          offering_hours: orderTypeConfigs[0]?.offering_hours,
        }),
  }
  const defaultType = defaultOrderType(orderTypes, context)
  const choices = Array.isArray(scope.choices)
    ? (scope.choices as MenuChoice[])
    : []

  return {
    offerings: readKitchenPublicOfferings(
      scope.kitchen_offerings,
      scope.kitchenMenuId || ''
    ).filter(
      (offering) =>
        context === 'generic' || offering.id === scope.kitchenOfferingId
    ),
    ...(scope.kitchenOfferingId
      ? { selectedOfferingId: scope.kitchenOfferingId }
      : {}),
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
