// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: serialize nested notification policy patches with ordering edits.
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: preserve custom Menu hours while compacting surface policies.
import { deleteField } from 'firebase/firestore'
import { computed } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type {
  KitchenMenuUpdateInput,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuServiceHoursConfig,
} from '../../../../../menu/models/kitchen-menu.model.ts'
import type { KitchenOrderType } from '../../../../models/order.model.ts'
import { resolveKitchenOperationHours } from '../../../../utils/kitchen-spine'
import {
  compactMenuServiceHoursDelta,
  resolveMenuServiceHours,
} from '../../../../../menu/utils/menu-service-hours'
import { useKitchenConsolePlace } from '../../identity/useKitchenConsolePlace'
import { useKitchenConsoleMenu } from './useKitchenConsoleMenu'

const clean = (value: unknown) => String(value ?? '').trim()
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const compactValue = (value: unknown): unknown => {
  if (typeof value === 'string') return clean(value) || undefined
  if (Array.isArray(value)) {
    const items = value.map(compactValue).filter((item) => item !== undefined)
    return items.length ? items : undefined
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactValue(item)] as const)
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value === null || value === undefined ? undefined : value
}

export function useKitchenConsoleMenuOrdering() {
  const menuState = useKitchenConsoleMenu()
  const { place } = useKitchenConsolePlace()
  const toast = useToastify()
  const orderTypePatchDrafts = new Map<KitchenOrderType, MenuOrderTypeConfig>()
  let orderTypePatchQueue = Promise.resolve()
  const operationalMenu = computed(() => menuState.menu.value)

  const ordering = computed<MenuOrderingConfig>(() => {
    const current = operationalMenu.value?.ordering
    const currentWithOldModes = current as
      | (MenuOrderingConfig & { modes?: MenuOrderTypeConfig[] })
      | undefined

    return {
      enabled: current?.enabled === true,
      order_types: Array.isArray(current?.order_types)
        ? current.order_types
        : Array.isArray(currentWithOldModes?.modes)
          ? currentWithOldModes.modes
          : [],
      ...(current?.service_hours
        ? { service_hours: current.service_hours }
        : {}),
    }
  })
  const orderTypeConfigs = computed(() => ordering.value.order_types)
  const orderingEnabled = computed(
    () => ordering.value.enabled && orderTypeConfigs.value.length > 0
  )
  const collectionConfig = computed(
    () =>
      orderTypeConfigs.value.find((type) => type.type === 'collection') || null
  )
  const deliveryConfig = computed(
    () =>
      orderTypeConfigs.value.find((type) => type.type === 'delivery') || null
  )
  const preOrderConfig = computed(
    () =>
      orderTypeConfigs.value.find((type) => type.type === 'pre_order') || null
  )
  const kitchenOperationHours = computed(() =>
    resolveKitchenOperationHours(
      menuState.selectedKitchen.value as Record<string, unknown> | null,
      place.value
    )
  )
  const menuServiceHours = computed(
    () =>
      resolveMenuServiceHours(
        ordering.value.service_hours,
        kitchenOperationHours.value
      )?.operation_hours || {
        source: 'custom' as const,
        timezone: kitchenOperationHours.value.timezone,
        windows: [],
      }
  )

  function defaultOrderTypeConfig(type: KitchenOrderType): MenuOrderTypeConfig {
    if (type === 'pre_order') {
      return {
        type,
        notice_hours: 24,
        asap_enabled: false,
        slot_interval_minutes: 30,
        schedule_horizon_days: 30,
        customer: {
          required_fields: ['name', 'email'],
        },
      }
    }
    if (type === 'collection') {
      return {
        type,
        notice_hours: 0.5,
        asap_enabled: true,
        slot_interval_minutes: 30,
        schedule_horizon_days: 7,
      }
    }
    if (type === 'delivery') {
      return {
        type,
        notice_hours: 0.75,
        asap_enabled: true,
        slot_interval_minutes: 30,
        schedule_horizon_days: 7,
        customer: {
          required_fields: ['name', 'phone'],
        },
      }
    }

    return { type }
  }

  function hasOrderType(type: KitchenOrderType) {
    return orderTypeConfigs.value.some((orderType) => orderType.type === type)
  }

  async function updateOrdering(nextOrdering: MenuOrderingConfig) {
    if (!menuState.canWrite.value) throw new Error('This menu is read-only.')
    const menuId = clean(menuState.menu.value?.id)
    if (!menuState.kitchenId.value || !menuId)
      throw new Error('No menu selected.')

    const orderTypes = nextOrdering.order_types
      .filter((orderType) => orderType.type)
      .map((orderType) => compactValue(orderType) as MenuOrderTypeConfig)
    const enabledOrderTypes = nextOrdering.enabled ? orderTypes : []
    const serviceHours = compactMenuServiceHoursDelta(
      nextOrdering.service_hours ?? ordering.value.service_hours
    )
    const orderingPatch = enabledOrderTypes.length
      ? {
          enabled: true,
          order_types: enabledOrderTypes,
          ...(serviceHours ? { service_hours: serviceHours } : {}),
        }
      : serviceHours
        ? {
            enabled: false,
            service_hours: serviceHours,
          }
        : null
    const patch: KitchenMenuUpdateInput = orderingPatch
      ? { ordering: orderingPatch as MenuOrderingConfig }
      : { ordering: deleteField() as never }

    try {
      await menuState.updateMenu(menuState.kitchenId.value, menuId, patch)
    } catch (error) {
      toast.add({
        title: 'Could not update ordering',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
      throw error
    }
  }

  async function setOrderType(type: KitchenOrderType, enabled: boolean) {
    if (!menuState.canWrite.value || enabled === hasOrderType(type)) return

    const withoutType = orderTypeConfigs.value.filter(
      (row) => row.type !== type
    )
    const orderTypes = enabled
      ? [...withoutType, defaultOrderTypeConfig(type)]
      : withoutType
    await updateOrdering({
      enabled: orderTypes.length > 0,
      order_types: orderTypes,
    })
  }

  async function saveOrderTypeConfig(config: MenuOrderTypeConfig) {
    if (!hasOrderType(config.type)) {
      throw new Error(`${config.type} is not enabled for this menu.`)
    }

    await updateOrdering({
      enabled: true,
      order_types: orderTypeConfigs.value.map((row) =>
        row.type === config.type ? config : row
      ),
    })
  }

  async function patchOrderTypeConfig(
    type: KitchenOrderType,
    patch: Partial<MenuOrderTypeConfig>
  ) {
    const current =
      orderTypePatchDrafts.get(type) ||
      orderTypeConfigs.value.find((row) => row.type === type)
    if (!current) throw new Error(`${type} is not enabled for this menu.`)

    const next = {
      ...current,
      ...patch,
      type,
      ...(patch.service_hours
        ? {
            service_hours: {
              ...current.service_hours,
              ...patch.service_hours,
            },
          }
        : {}),
      ...(patch.fulfilment
        ? {
            fulfilment: {
              ...current.fulfilment,
              ...patch.fulfilment,
            },
          }
        : {}),
      ...(patch.customer
        ? {
            customer: {
              ...current.customer,
              ...patch.customer,
            },
          }
        : {}),
      ...(patch.availability
        ? {
            availability: {
              ...current.availability,
              ...patch.availability,
            },
          }
        : {}),
      ...(patch.notifications
        ? {
            notifications: {
              ...current.notifications,
              ...patch.notifications,
              ...(patch.notifications.whatsapp
                ? {
                    whatsapp: {
                      ...current.notifications?.whatsapp,
                      ...patch.notifications.whatsapp,
                    },
                  }
                : {}),
            },
          }
        : {}),
    }
    orderTypePatchDrafts.set(type, next)
    orderTypePatchQueue = orderTypePatchQueue
      .catch(() => undefined)
      .then(async () => {
        const latest = orderTypePatchDrafts.get(type)
        if (!latest) return

        await saveOrderTypeConfig(latest)
        if (orderTypePatchDrafts.get(type) === latest) {
          orderTypePatchDrafts.delete(type)
        }
      })

    await orderTypePatchQueue
  }

  async function saveMenuServiceHours(serviceHours: MenuServiceHoursConfig) {
    await updateOrdering({
      ...ordering.value,
      service_hours: serviceHours,
    })
  }

  return {
    ...menuState,
    collectionConfig,
    deliveryConfig,
    hasOrderType,
    kitchenOperationHours,
    menuServiceHours,
    ordering,
    orderingEnabled,
    orderTypeConfigs,
    preOrderConfig,
    patchOrderTypeConfig,
    saveOrderTypeConfig,
    saveMenuServiceHours,
    setOrderType,
    updateOrdering,
  }
}
