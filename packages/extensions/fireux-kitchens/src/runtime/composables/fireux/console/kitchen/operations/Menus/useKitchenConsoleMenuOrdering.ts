// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: serialize nested notification policy patches with ordering edits.
import { computed } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type {
  KitchenMenu,
  KitchenMenuUpdateInput,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuServiceHoursConfig,
} from '../../../../../../models/kitchen/menu/kitchen-menu.model'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import { readKitchenOperationHours } from '../../../../../../utils/kitchen-spine'
import { resolveMenuServiceHours } from '../../../../../../utils/menu-service-hours'
import { useKitchenConsoleMenu } from './useKitchenConsoleMenu'

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMenuOrdering() {
  const menuState = useKitchenConsoleMenu()
  const toast = useToastify()
  const orderTypePatchDrafts = new Map<KitchenOrderType, MenuOrderTypeConfig>()
  let orderTypePatchQueue = Promise.resolve()
  const operationalMenu = computed(() =>
    menuState.menu.value as unknown as KitchenMenu | null
  )

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
      ...(current?.service_hours ? { service_hours: current.service_hours } : {}),
    }
  })
  const orderTypeConfigs = computed(() => ordering.value.order_types)
  const orderingEnabled = computed(() =>
    ordering.value.enabled && orderTypeConfigs.value.length > 0
  )
  const collectionConfig = computed(() =>
    orderTypeConfigs.value.find(type => type.type === 'collection') || null
  )
  const deliveryConfig = computed(() =>
    orderTypeConfigs.value.find(type => type.type === 'delivery') || null
  )
  const preOrderConfig = computed(() =>
    orderTypeConfigs.value.find(type => type.type === 'pre_order') || null
  )
  const kitchenOperationHours = computed(() =>
    readKitchenOperationHours(
      menuState.selectedKitchen.value as Record<string, unknown> | null
    )
  )
  const menuServiceHours = computed(() =>
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
    const inheritedServiceHours = {
      inherit_menu_service_hours: true,
    }
    if (type === 'pre_order') {
      return {
        type,
        notice_hours: 24,
        asap_enabled: false,
        slot_interval_minutes: 30,
        schedule_horizon_days: 30,
        service_hours: inheritedServiceHours,
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
        service_hours: inheritedServiceHours,
      }
    }
    if (type === 'delivery') {
      return {
        type,
        notice_hours: 0.75,
        asap_enabled: true,
        slot_interval_minutes: 30,
        schedule_horizon_days: 7,
        service_hours: inheritedServiceHours,
        customer: {
          required_fields: ['name', 'phone'],
        },
      }
    }

    return { type, service_hours: inheritedServiceHours }
  }

  function hasOrderType(type: KitchenOrderType) {
    return orderTypeConfigs.value.some(orderType => orderType.type === type)
  }

  async function updateOrdering(nextOrdering: MenuOrderingConfig) {
    if (!menuState.canWrite.value) throw new Error('This menu is read-only.')
    const menuId = clean(menuState.menu.value?.id)
    if (!menuState.kitchenId.value || !menuId) throw new Error('No menu selected.')

    const orderTypes = nextOrdering.order_types.filter(orderType => orderType.type)
    const patch: KitchenMenuUpdateInput = {
      ordering: {
        enabled: nextOrdering.enabled && orderTypes.length > 0,
        order_types: orderTypes,
        ...(nextOrdering.service_hours || ordering.value.service_hours
          ? { service_hours: nextOrdering.service_hours || ordering.value.service_hours }
          : {}),
      },
    }

    try {
      // The Firestore mutation is still crossing the concurrent Root Menu /
      // KitchenMenu type migration. Keep that compatibility cast at this one
      // console boundary rather than spreading it through surface editors.
      const updateKitchenMenu = menuState.updateMenu as unknown as (
        kitchenId: string,
        menuId: string,
        input: KitchenMenuUpdateInput
      ) => Promise<void>
      await updateKitchenMenu(menuState.kitchenId.value, menuId, patch)
    } catch (error) {
      toast.add({
        title: 'Could not update ordering',
        description: error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
      throw error
    }
  }

  async function setOrderType(type: KitchenOrderType, enabled: boolean) {
    if (!menuState.canWrite.value || enabled === hasOrderType(type)) return

    const withoutType = orderTypeConfigs.value.filter(row => row.type !== type)
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
      order_types: orderTypeConfigs.value.map(row =>
        row.type === config.type ? config : row
      ),
    })
  }

  async function patchOrderTypeConfig(
    type: KitchenOrderType,
    patch: Partial<MenuOrderTypeConfig>
  ) {
    const current = orderTypePatchDrafts.get(type) ||
      orderTypeConfigs.value.find(row => row.type === type)
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
