<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Orders</h2>
          </div>

          <div class="collection-manager__controls flex flex-1 items-center gap-2">
            <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
              <UBadge variant="soft">
                {{ ticketOrders.length }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>

      <div v-if="ticketOrders.length" class="flex flex-wrap items-start gap-3">
        <OrderCardsTicket
          v-for="(ticket, index) in ticketOrders"
          :key="ticket.id"
          :order="ticket"
          :next="isNextTicket(index)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No orders found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'

const { ticketOrders, isNextTicket, debug } = useKitchenConsoleOrders()
</script>
