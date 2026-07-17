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
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-book-open"
        title="Browse is the base menu"
        description="A published menu remains readable at /menus/{menuId}. Ordering surfaces add choices; Browse is not an order type."
      />

      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="surface in orderSurfaceOptions"
          :key="surface.key"
          class="rounded-md border p-3 transition-colors"
          :class="hasSurfaceOrderType(surface)
            ? 'border-primary/50 bg-primary/5'
            : 'border-default bg-default/60'"
        >
          <div class="min-w-0 space-y-1">
            <p class="text-sm font-bold text-highlighted">
              {{ surface.label }}
            </p>
            <p class="text-sm leading-5 text-dimmed">
              {{ surface.description }}
            </p>
          </div>

          <code
            v-if="surface.route"
            class="mt-3 inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
          >
            {{ surface.route }}
          </code>

          <div class="mt-3 grid gap-2">
            <div
              v-for="choice in surface.choices"
              :key="choice.type"
              class="flex items-start justify-between gap-3 rounded-md border border-default bg-default/80 p-3"
            >
              <div class="min-w-0 space-y-1">
                <p class="text-sm font-semibold text-highlighted">
                  {{ choice.label }}
                </p>
                <p class="text-xs leading-5 text-dimmed">
                  {{ choice.description }}
                </p>
                <code
                  v-if="choice.route"
                  class="inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
                >
                  {{ choice.route }}
                </code>
              </div>

              <USwitch
                :model-value="hasOrderType(choice.type)"
                :disabled="!canWrite"
                @update:model-value="setOrderType(choice.type, Boolean($event))"
              />
            </div>
          </div>
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

      <ConsoleKitchenOperationsMenusEditCollectionTiming
        v-if="collectionConfig"
        :config="collectionConfig"
        :disabled="!canWrite"
        :kitchen-hours="kitchenOperationHours"
        :saving="collectionTimingSaving"
        @save="saveCollectionTiming"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuUpdateInput,
} from '../../../../../../models/kitchen/menu/menu.model'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import { readKitchenOperationHours } from '../../../../../../utils/kitchen-spine'

type OrderTypeChoice = {
  type: KitchenOrderType
  label: string
  description: string
  route?: string
}

type OrderSurfaceOption = {
  key: string
  label: string
  description: string
  route?: string
  choices: OrderTypeChoice[]
}

const {
  menu,
  selectedKitchen,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()
const collectionTimingSaving = ref(false)

const orderSurfaceOptions: OrderSurfaceOption[] = [
  {
    key: 'home-options',
    label: 'Home options',
    description: 'A grouping for customers away from the venue. Delivery and Collection are separate surfaces.',
    choices: [
      {
        type: 'delivery',
        label: 'Delivery',
        description: 'Deliver the order to a customer address.',
        route: '/menus/{menuId}.delivery',
      },
      {
        type: 'collection',
        label: 'Collection',
        description: 'Prepare the order for customer collection.',
        route: '/menus/{menuId}.collection',
      },
    ],
  },
  {
    key: 'table-qr',
    label: 'Table QR',
    description: 'Customer is already seated. The table number is carried into the order.',
    route: '/menus/{menuId}.dine_in',
    choices: [
      {
        type: 'dine_in',
        label: 'Dine in',
        description: 'Send an order from a table to the kitchen.',
        route: '/menus/{menuId}.dine_in',
      },
    ],
  },
  {
    key: 'kiosk',
    label: 'Kiosk',
    description: 'One shared terminal surface. Eat here and Take away are preparation, handoff, and tax flags inside it.',
    route: '/menus/{menuId}.kiosk',
    choices: [
      {
        type: 'eat_in',
        label: 'Eat here',
        description: 'Use the eat-in flag for tray preparation and the applicable tax treatment.',
      },
      {
        type: 'takeaway',
        label: 'Take away',
        description: 'Use the takeaway flag for bag preparation and the applicable tax treatment.',
      },
    ],
  },
  {
    key: 'pre-order',
    label: 'Pre-order',
    description: 'Timing-first request. The kitchen confirms before deposit or final preparation.',
    route: '/menus/{menuId}.pre_order',
    choices: [
      {
        type: 'pre_order',
        label: 'Pre-order',
        description: 'Require the customer to request a future time.',
        route: '/menus/{menuId}.pre_order',
      },
    ],
  },
  {
    key: 'room-service',
    label: 'Room service',
    description: 'Internal delivery to a room inside a hotel, aparthotel, or venue.',
    route: '/menus/{menuId}.room_service',
    choices: [
      {
        type: 'room_service',
        label: 'Room service',
        description: 'Collect a room destination and guest name.',
        route: '/menus/{menuId}.room_service',
      },
    ],
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
const collectionConfig = computed(() =>
  orderTypeConfigs.value.find((type) => type.type === 'collection') || null
)
const kitchenOperationHours = computed(() =>
  readKitchenOperationHours(
    selectedKitchen.value as Record<string, unknown> | null
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

  if (type === 'collection') {
    return {
      type,
      notice_hours: 0.5,
      asap_enabled: true,
      slot_interval_minutes: 30,
      schedule_horizon_days: 7,
    }
  }

  return { type }
}

function hasOrderType(type: KitchenOrderType) {
  return orderTypeConfigs.value.some((orderType) => orderType.type === type)
}

function hasSurfaceOrderType(surface: OrderSurfaceOption) {
  return surface.choices.some((choice) => hasOrderType(choice.type))
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

async function setOrderType(type: KitchenOrderType, enabled: boolean) {
  if (!canWrite.value) return
  const currentlyEnabled = hasOrderType(type)
  if (enabled === currentlyEnabled) return

  const nextWithoutType = orderTypeConfigs.value.filter((orderType) =>
    orderType.type !== type
  )
  const nextOrderTypes = enabled
    ? [
        ...nextWithoutType,
        orderTypeConfig(type),
      ]
    : nextWithoutType
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

async function saveCollectionTiming(config: MenuOrderTypeConfig) {
  if (!canWrite.value || collectionTimingSaving.value) return

  collectionTimingSaving.value = true
  try {
    const nextOrderTypes = orderTypeConfigs.value.map((orderType) =>
      orderType.type === 'collection' ? config : orderType
    )
    await updateOrdering({
      enabled: nextOrderTypes.length > 0,
      order_types: nextOrderTypes,
    })
    toast.add({
      title: 'Collection timing updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } finally {
    collectionTimingSaving.value = false
  }
}
</script>
