<template>
  <WorkspaceKitchenOrdersRail
    v-for="group in groups"
    :key="group.label"
    :label="group.label"
    :count="group.orders.length"
    empty-label="No scheduled pickups"
    accent="neutral"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="order in group.orders" :key="order.id">
        <WorkspaceKitchenOrdersTicketPresentation
          :order="order"
          :interactive="false"
          :show-customer-details="true"
        />
        <UButton
          v-if="group.ready"
          label="Start preparation"
          :disabled="!canInteract(order)"
          :loading="isOrderTransitioning(order.id)"
          @click="start(order.id)"
        />
      </div>
    </div>
  </WorkspaceKitchenOrdersRail>
</template>
<script setup lang="ts">
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'
import { computed } from 'vue'
const {
  scheduledOrders,
  paymentOrders,
  startPreparation,
  canInteract,
  isOrderTransitioning,
} = useKitchenOrdersContext()
const groups = computed(() =>
  [
    {
      label: 'Awaiting customer payment',
      orders: paymentOrders.value,
      ready: false,
    },
    {
      label: 'Scheduled',
      orders: scheduledOrders.value.filter(
        (order) => order.status === 'scheduled'
      ),
      ready: true,
    },
    {
      label: 'Ready to prepare',
      orders: scheduledOrders.value.filter(
        (order) => order.status === 'awaiting_preparation'
      ),
      ready: true,
    },
  ].filter((group) => group.orders.length)
)
async function start(id: string) {
  try {
    await startPreparation(id)
  } catch {
    /* The shared transition error is displayed by Orders. */
  }
}
</script>
