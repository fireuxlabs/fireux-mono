<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Ordering</h2>
          <p class="text-sm text-dimmed">
            Enable the dine-in and dine-out systems this menu should offer.
          </p>
        </div>

        <UBadge :color="orderingEnabled ? 'success' : 'neutral'" variant="soft">
          {{ orderingEnabled ? 'Ordering on' : 'Ordering off' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <div class="space-y-3">
        <section
          v-for="group in orderTypeGroups"
          :key="group.key"
          class="ordering-group"
        >
          <div class="ordering-group__header">
            <h3 class="ordering-group__title">{{ group.label }}</h3>
            <p class="ordering-group__description">{{ group.description }}</p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <button
              v-for="option in group.options"
              :key="option.type"
              type="button"
              class="ordering-option"
              :class="{ 'ordering-option--selected': hasOrderType(option.type) }"
              :disabled="!canWrite"
              @click="toggleOrderType(option.type)"
            >
              <span class="ordering-option__title">{{ option.label }}</span>
              <span class="ordering-option__description">{{ option.description }}</span>
            </button>
          </div>

          <div
            v-if="group.key === 'dine-in' && hasOrderType('pre_order')"
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
        </section>
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
  type: KitchenOrderType
  label: string
  description: string
}
type OrderTypeGroup = {
  key: string
  label: string
  description: string
  options: OrderTypeOption[]
}

const {
  menu,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()

const orderTypeGroups: OrderTypeGroup[] = [
  {
    key: 'dine-in',
    label: 'Dine in systems',
    description: 'Orders consumed on site or handled as in-house service.',
    options: [
      {
        type: 'dine_in',
        label: 'Dine in',
        description: 'Guests order for normal in-venue service.',
      },
      {
        type: 'pre_order',
        label: 'Pre-order',
        description: 'Guests order ahead for a later dine-in service.',
      },
      {
        type: 'room_service',
        label: 'Room service',
        description: 'Hotel or private-room service.',
      },
    ],
  },
  {
    key: 'dine-out',
    label: 'Dine out systems',
    description: 'Take-away systems where food leaves the normal table-service flow.',
    options: [
      {
        type: 'take_away',
        label: 'Take away',
        description: 'Guests order in venue, wait in a queue, then collect a tray or bag.',
      },
      {
        type: 'collection',
        label: 'Collection',
        description: 'Guests collect from the kitchen.',
      },
      {
        type: 'delivery',
        label: 'Delivery',
        description: 'Guests ask for food to be delivered.',
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

async function toggleOrderType(type: KitchenOrderType) {
  if (!canWrite.value) return

  const nextOrderTypes = hasOrderType(type)
    ? orderTypeConfigs.value.filter((orderType) => orderType.type !== type)
    : [...orderTypeConfigs.value, orderTypeConfig(type)]
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

<style scoped>
.ordering-group {
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem 0;
  border-top: 1px solid var(--ui-border);
}

.ordering-group:first-child {
  padding-top: 0;
  border-top: 0;
}

.ordering-group__header {
  display: grid;
  gap: 0.2rem;
}

.ordering-group__title {
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
  font-weight: 800;
}

.ordering-group__description {
  color: var(--ui-text-dimmed);
  font-size: 0.8rem;
  line-height: 1.4;
}

.ordering-option {
  display: grid;
  gap: 0.25rem;
  min-height: 5rem;
  padding: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.85rem;
  background: var(--ui-bg);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.ordering-option:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.ordering-option--selected {
  border-color: color-mix(in srgb, var(--ui-primary) 58%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary) 24%, transparent);
}

.ordering-option__title {
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
  font-weight: 800;
}

.ordering-option__description {
  color: var(--ui-text-dimmed);
  font-size: 0.8rem;
  line-height: 1.35;
}
</style>
