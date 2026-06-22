<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title space-y-1">
            <h2>Order board</h2>
            <p class="text-sm text-dimmed">
              Incoming tickets for {{ selectedKitchenName }}.
            </p>
          </div>

          <div class="collection-manager__controls flex flex-1 items-center gap-2">
            <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
              <UBadge variant="soft">
                {{ countLabel }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">
        Loading orders...
      </p>

      <div
        v-else-if="ticketOrders.length"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        <OrderCardsTicket
          v-for="(ticket, index) in ticketOrders"
          :key="ticket.id"
          :order="ticket"
          :next="isNextTicket(index)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No orders for this kitchen yet.
      </p>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <h2>Ordering layer</h2>
          <p class="text-sm text-dimmed">
            Orders are separate from menus. A menu lists what can be bought; this board shows what customers have sent to the kitchen.
          </p>
        </div>
      </template>

      <div class="grid gap-3 md:grid-cols-3">
        <div class="rounded-lg border border-default p-4">
          <p class="text-sm font-semibold text-highlighted">Menu</p>
          <p class="mt-1 text-sm text-dimmed">
            Dishes, prices, options, and availability.
          </p>
        </div>

        <div class="rounded-lg border border-primary/40 bg-primary/5 p-4">
          <p class="text-sm font-semibold text-highlighted">Orders</p>
          <p class="mt-1 text-sm text-dimmed">
            Customer tickets waiting for kitchen action.
          </p>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="text-sm font-semibold text-highlighted">Fulfilment</p>
          <p class="mt-1 text-sm text-dimmed">
            Pickup, delivery, deposits, reservations, and handoff rules.
          </p>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'

const {
  selectedKitchen,
  ticketOrders,
  isNextTicket,
  pending,
  debug,
} = useKitchenConsoleOrders()

const text = (value: unknown) => String(value ?? '').trim()
const selectedKitchenName = computed(() => {
  const kitchen = selectedKitchen.value as Record<string, unknown> | null

  return (
    text(kitchen?.display_name) ||
    text(kitchen?.name) ||
    text(kitchen?.short_name) ||
    'the selected kitchen'
  )
})
const countLabel = computed(() => {
  const count = ticketOrders.value.length

  return count === 1 ? '1 order' : `${count} orders`
})
</script>
