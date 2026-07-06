<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Ordering</h2>
          <p class="text-sm text-dimmed">
            Choose which guest surfaces this menu should offer.
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
            <code
              v-if="group.route"
              class="ordering-group__route"
            >
              {{ group.route }}
            </code>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <button
              v-for="option in group.options"
              :key="option.key"
              type="button"
              class="ordering-option"
              :class="{ 'ordering-option--selected': hasOrderTypeOption(option) }"
              :disabled="!canWrite"
              @click="toggleOrderTypeOption(option)"
            >
              <span class="ordering-option__title">{{ option.label }}</span>
              <span class="ordering-option__description">{{ option.description }}</span>
              <code
                v-if="option.route"
                class="ordering-option__route"
              >
                {{ option.route }}
              </code>
            </button>
          </div>

          <div
            v-if="group.key === 'scheduled' && hasOrderType('pre_order')"
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
  key: string
  types: KitchenOrderType[]
  label: string
  description: string
  route?: string
}
type OrderTypeGroup = {
  key: string
  label: string
  description: string
  route?: string
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
    key: 'home',
    label: 'Home Delivery',
    description: 'Remote ordering with delivery first. Collection comes with the same home surface.',
    route: '/menus/{menuId}.home',
    options: [
      {
        key: 'home-delivery',
        types: ['delivery', 'collection'],
        label: 'Home Delivery',
        description: 'Guests order from home with delivery as the bias and collection available from the same menu.',
      },
    ],
  },
  {
    key: 'premises',
    label: 'On Premises',
    description: 'Ordering while guests are at the premises.',
    options: [
      {
        key: 'table-ordering',
        types: ['dine_in'],
        label: 'Dine in',
        description: 'Guests order inside the restaurant.',
        route: '/menus/{menuId}.dine_in',
      },
      {
        key: 'kiosk-ordering',
        types: ['eat_in', 'takeaway'],
        label: 'Kiosk Ordering',
        description: 'Eat-in and takeaway. Uses queue / order number.',
        route: '/menus/{menuId}.kiosk',
      },
    ],
  },
  {
    key: 'scheduled',
    label: 'Scheduled & private',
    description: 'Specific systems that do not belong to the home, table, or kiosk surface yet.',
    options: [
      {
        key: 'pre-order',
        types: ['pre_order'],
        label: 'Pre-order',
        description: 'Guests order ahead for a later service.',
      },
      {
        key: 'room-service',
        types: ['room_service'],
        label: 'Room service',
        description: 'Hotel or private-room service.',
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

function hasOrderTypeOption(option: OrderTypeOption) {
  return option.types.some(hasOrderType)
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

async function toggleOrderTypeOption(option: OrderTypeOption) {
  if (!canWrite.value) return

  const optionTypes = new Set(option.types)
  const nextOrderTypes = hasOrderTypeOption(option)
    ? orderTypeConfigs.value.filter((orderType) => !optionTypes.has(orderType.type))
    : [
        ...orderTypeConfigs.value.filter((orderType) => !optionTypes.has(orderType.type)),
        ...option.types.map(orderTypeConfig),
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

.ordering-group__route {
  width: fit-content;
  padding: 0.2rem 0.42rem;
  border-radius: 0.38rem;
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
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

.ordering-option__route {
  width: fit-content;
  margin-top: 0.12rem;
  padding: 0.16rem 0.36rem;
  border-radius: 0.34rem;
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-size: 0.66rem;
  font-weight: 800;
}
</style>
