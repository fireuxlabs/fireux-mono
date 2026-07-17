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
              class="grid gap-2"
            >
              <div class="flex items-start justify-between gap-3 rounded-md border border-default bg-default/80 p-3">
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

              <UButton
                v-if="choice.settingsPath && hasOrderType(choice.type)"
                :to="menuOrderingPath(choice.settingsPath)"
                color="neutral"
                variant="soft"
                size="sm"
                block
                trailing-icon="i-lucide-chevron-right"
              >
                Configure {{ choice.label }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenuOrdering } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuOrdering'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'

type OrderTypeChoice = {
  type: KitchenOrderType
  label: string
  description: string
  route?: string
  settingsPath?: string
}

type OrderSurfaceOption = {
  key: string
  label: string
  description: string
  route?: string
  choices: OrderTypeChoice[]
}

const {
  canWrite,
  hasOrderType,
  menu,
  menuId,
  orderingEnabled,
  setOrderType,
} = useKitchenConsoleMenuOrdering()

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
        settingsPath: 'collection',
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

function hasSurfaceOrderType(surface: OrderSurfaceOption) {
  return surface.choices.some((choice) => hasOrderType(choice.type))
}

function menuOrderingPath(surface: string) {
  return `/console/kitchen/menus/${encodeURIComponent(menuId.value)}/ordering/${surface}`
}
</script>
