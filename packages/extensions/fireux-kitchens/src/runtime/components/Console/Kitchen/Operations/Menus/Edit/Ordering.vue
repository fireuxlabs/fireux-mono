<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Ordering</h2>
          <p class="text-sm text-dimmed">
            Choose which ordering surfaces this menu should offer.
          </p>
        </div>

        <UBadge :color="orderingEnabled ? 'success' : 'neutral'" variant="soft">
          {{ orderingEnabled ? 'Ordering on' : 'Ordering off' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="option in orderTypeOptions"
          :key="option.key"
          class="rounded-md border p-3 transition-colors"
          :class="hasOrderTypeOption(option)
            ? 'border-primary/50 bg-primary/5'
            : 'border-default bg-default/60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <p class="text-sm font-bold text-highlighted">
                {{ option.label }}
              </p>
              <p class="text-sm leading-5 text-dimmed">
                {{ option.description }}
              </p>
            </div>

            <USwitch
              :model-value="hasOrderTypeOption(option)"
              :disabled="!canWrite"
              @update:model-value="setOrderTypeOption(option, Boolean($event))"
            />
          </div>

          <code
            v-if="option.route"
            class="mt-3 inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
          >
            {{ option.route }}
          </code>
        </div>
      </div>

      <div
        v-if="hasOrderType('pre_order')"
        class="grid gap-3 md:grid-cols-2"
      >
        <UFormField label="Pre-order notice">
          <div class="flex items-center gap-2">
            <UInput
              :model-value="preOrderNoticeHours"
              type="number"
              min="1"
              :disabled="!canWrite"
              @update:model-value="setPreOrderNoticeHours"
            />
            <span class="text-sm text-dimmed">hours</span>
          </div>
        </UFormField>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuUpdateInput,
} from '../../../../../../models/kitchen/menu/menu.model'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'

type OrderTypeOption = {
  key: string
  types: KitchenOrderType[]
  label: string
  description: string
  route?: string
}

const {
  menu,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()

const orderTypeOptions: OrderTypeOption[] = [
  {
    key: 'from-home',
    types: ['delivery', 'collection'],
    label: 'From home',
    description: 'Customer starts away from the venue. Delivery is biased; collection can sit beside it.',
    route: '/menus/{menuId}.home',
  },
  {
    key: 'table-qr',
    types: ['dine_in'],
    label: 'Table QR',
    description: 'Customer is already seated. The table number is carried into the order.',
    route: '/menus/{menuId}.dine_in',
  },
  {
    key: 'kiosk',
    types: ['eat_in', 'takeaway'],
    label: 'Kiosk',
    description: 'Shared in-store terminal. Eat in means tray; takeaway means bag.',
    route: '/menus/{menuId}.kiosk',
  },
  {
    key: 'pre-order',
    types: ['pre_order'],
    label: 'Pre-order',
    description: 'Timing-first request. The kitchen confirms before deposit or final preparation.',
    route: '/menus/{menuId}.pre_order',
  },
  {
    key: 'room-service',
    types: ['room_service'],
    label: 'Room service',
    description: 'Internal delivery to a room inside a hotel, aparthotel, or venue.',
    route: '/menus/{menuId}.room_service',
  },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeNoticeHours = (value: unknown) => {
  const hours = Number(value)

  return Number.isFinite(hours) && hours > 0 ? Math.round(hours) : 24
}
const ordering = computed<MenuOrderingConfig>(() => {
  const current = menu.value?.ordering
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
const orderingEnabled = computed(() =>
  ordering.value.enabled && ordering.value.order_types.length > 0
)
const orderTypeConfigs = computed(() => ordering.value.order_types)
const preOrderNoticeHours = computed(() =>
  normalizeNoticeHours(
    orderTypeConfigs.value.find((type) => type.type === 'pre_order')?.notice_hours
  )
)

function orderTypeConfig(type: KitchenOrderType): MenuOrderTypeConfig {
  const existing = orderTypeConfigs.value.find((orderType) => orderType.type === type)
  if (existing) return existing

  if (type === 'pre_order') {
    return {
      type,
      notice_hours: 24,
    }
  }

  return { type }
}

function hasOrderType(type: KitchenOrderType) {
  return orderTypeConfigs.value.some((orderType) => orderType.type === type)
}

function hasOrderTypeOption(option: OrderTypeOption) {
  return option.types.every(hasOrderType)
}

async function updateOrdering(nextOrdering: MenuOrderingConfig) {
  if (!canWrite.value) throw new Error('This menu is read-only.')
  const currentMenuId = normalizeString(menu.value?.id)
  if (!kitchenId.value || !currentMenuId) throw new Error('No menu selected.')

  const cleanOrderTypes = nextOrdering.order_types.filter((orderType) => orderType.type)
  const enabled = nextOrdering.enabled && cleanOrderTypes.length > 0
  const orderingPatch: MenuOrderingConfig = {
    enabled,
    order_types: cleanOrderTypes,
    ...(ordering.value.service_hours
      ? { service_hours: ordering.value.service_hours }
      : {}),
  }
  const patch: MenuUpdateInput = {
    ordering: orderingPatch,
  }

  try {
    await updateMenu(kitchenId.value, currentMenuId, patch)
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

async function setOrderTypeOption(option: OrderTypeOption, enabled: boolean) {
  if (!canWrite.value) return
  const currentlyEnabled = hasOrderTypeOption(option)
  if (enabled === currentlyEnabled) return

  const optionTypes = new Set(option.types)
  const nextOrderTypes = enabled
    ? [
        ...orderTypeConfigs.value.filter((orderType) => !optionTypes.has(orderType.type)),
        ...option.types.map(orderTypeConfig),
      ]
    : [
        ...orderTypeConfigs.value.filter((orderType) => !optionTypes.has(orderType.type)),
      ]
  await updateOrdering({
    enabled: nextOrderTypes.length > 0,
    order_types: nextOrderTypes,
  })
}

async function setPreOrderNoticeHours(value: string | number) {
  const nextHours = normalizeNoticeHours(value)
  const nextOrderTypes = orderTypeConfigs.value.map((orderType) =>
    orderType.type === 'pre_order'
      ? {
          ...orderType,
          notice_hours: nextHours,
        }
      : orderType
  )

  await updateOrdering({
    enabled: nextOrderTypes.length > 0,
    order_types: nextOrderTypes,
  })
}
</script>
