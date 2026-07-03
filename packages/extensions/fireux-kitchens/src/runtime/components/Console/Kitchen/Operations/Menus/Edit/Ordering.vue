<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Ordering</h2>
          <p class="text-sm text-dimmed">
            Choose whether this menu can create orders and which order types guests can use.
          </p>
        </div>

        <UBadge :color="orderingEnabled ? 'success' : 'neutral'" variant="soft">
          {{ orderingEnabled ? 'Ordering on' : 'Browse only' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <UCheckbox
        :model-value="orderingEnabled"
        :disabled="!canWrite"
        label="Accept orders from this menu"
        @update:model-value="setOrderingEnabled"
      />

      <div v-if="orderingEnabled" class="space-y-3">
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="option in orderTypeOptions"
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

        <div v-if="hasOrderType('pre_order')" class="grid gap-3 md:grid-cols-2">
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

      <p v-if="saveState" class="text-xs text-dimmed">
        {{ saveState }}
      </p>
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
  MenuView,
  MenuUpdateInput,
} from '../../../../../../models/kitchen/menu/menu.model'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'

type OrderTypeOption = {
  type: KitchenOrderType
  label: string
  description: string
}

const {
  menu,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()
const saveState = ref('')

const orderTypeOptions: OrderTypeOption[] = [
  {
    type: 'dine_in',
    label: 'Dine in',
    description: 'Guests order for normal in-venue service.',
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
const publicViews = computed<MenuView[]>(() =>
  Array.isArray(menu.value?.public_views) ? menu.value.public_views : []
)
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

async function updateOrdering(
  nextOrdering: MenuOrderingConfig,
  nextViews?: MenuView[]
) {
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
    public_views: enabled
      ? nextViews || (publicViews.value.length ? publicViews.value : ['browse', 'order'])
      : [],
  }

  saveState.value = 'Saving...'
  try {
    await updateMenu(kitchenId.value, currentMenuId, patch)
    saveState.value = 'Saved'
  } catch (error) {
    saveState.value = 'Save failed'
    toast.add({
      title: 'Could not update ordering',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}

async function setOrderingEnabled(value: boolean | 'indeterminate') {
  const enabled = value === true
  if (!enabled) {
    await updateOrdering({ enabled: false, order_types: [] }, [])
    return
  }

  const nextOrderTypes = orderTypeConfigs.value.length
    ? orderTypeConfigs.value
    : [{ type: 'dine_in' as const }]
  await updateOrdering({ enabled: true, order_types: nextOrderTypes })
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
