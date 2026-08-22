<!-- Concurrent edit — 2026-07-25 — Use the real read-only Orders board as the Main App hero proof. -->
<template>
  <WorkspaceKitchenOperationsOrdersRail
    v-if="heroPassOrders.length"
    class="misebox-home__service-pass"
    accent="success"
    :count="heroPassOrders.length"
    empty-label="No Orders are waiting at the pass."
    label="Pass"
    role="img"
    aria-label="Read-only Kitchen Workspace snapshot showing three fictional Orders at the Pass"
  >
    <div
      class="misebox-home__pass-tickets"
      aria-hidden="true"
      inert
    >
      <WorkspaceKitchenOperationsOrdersTicketPresentation
        v-for="order in heroPassOrders"
        :key="order.id"
        :order="order"
        :interactive="false"
        :show-customer-details="false"
        prominent
      />
    </div>
  </WorkspaceKitchenOperationsOrdersRail>

  <UAlert
    v-else-if="productDemoError"
    color="neutral"
    variant="soft"
    title="Service preview unavailable"
    description="No live Kitchen data was loaded."
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from 'fireux-kitchens/runtime/kitchen/utils/order'

const {
  data: productDemo,
  error: productDemoError,
} = await useMiseboxProductDemo()

const heroPassOrders = computed<KitchenOrder[]>(() => {
  const orders: KitchenOrder[] = productDemo.value?.service.orders || []

  return orders
    .filter(order =>
      order.status !== 'cancelled'
      && order.status !== 'pending_payment'
    )
    .slice(-3)
    .map(order => ({
      ...order,
      status: 'ready',
      customer: {},
      items: order.items.map(item => ({ ...item, checked: true })),
    }))
})
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.misebox-home__service-pass {
  width: 100%;
  min-width: 0;
  pointer-events: none;
  user-select: none;
}

.misebox-home__pass-tickets {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.misebox-home__service-pass
  :deep(.order-ticket-header__actions),
.misebox-home__service-pass
  :deep(.order-ticket-footer__identity button) {
  display: none;
}

.misebox-home__service-pass
  :deep(.orders-rail > div) {
  padding-inline: calc(var(--spacing) * 3);
}

.misebox-home__service-pass
  :deep(.orders-rail > div:last-child),
.misebox-home__service-pass
  :deep(.order-ticket > div) {
  padding: calc(var(--spacing) * 3);
}

.misebox-home__service-pass
  :deep(.order-ticket-header__identity > [aria-label="Waiting for kitchen acceptance"]) {
  display: none;
}

@media (min-width: 640px) {
  .misebox-home__pass-tickets {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
