<template>
  <div class="mt-5" aria-label="Orders preview">
    <template v-if="activeOrderCount">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p class="m-0 truncate text-sm font-semibold text-highlighted">
          {{ kitchenName }}
        </p>
        <UBadge color="neutral" variant="soft" size="sm">
          {{ activeOrderCount }} active orders
        </UBadge>
      </div>

      <div class="orders-preview max-h-[24rem] overflow-y-auto pr-1">
        <WorkspaceKitchenOperationsOrdersRail
          v-for="stage in orderStages"
          :key="stage.id"
          :accent="stage.accent"
          :count="stage.orders.length"
          :empty-label="stage.emptyLabel"
          :label="stage.label"
        >
          <div class="grid gap-2 sm:grid-cols-2">
            <WorkspaceKitchenOperationsOrdersTicketPresentation
              v-for="order in stage.orders"
              :key="order.id"
              :order="order"
              :interactive="false"
              :prominent="stage.id === 'pass'"
              :show-customer-details="false"
            />
          </div>
        </WorkspaceKitchenOperationsOrdersRail>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Orders preview unavailable' : 'No active orders'"
      :description="error
        ? 'No live Kitchen data was loaded.'
        : 'The Deanos service board is clear.'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  deriveKitchenOrderBoardStage,
  type KitchenOrderBoardStage,
} from 'fireux-kitchens/runtime/kitchen/utils/order'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoOrder =
  MiseboxProductDemo['workspace']['orders'][number]

type ProductDemoOrderStage = {
  id: Extract<KitchenOrderBoardStage, 'incoming' | 'queue' | 'pass'>
  label: string
  accent: 'warning' | 'primary' | 'success'
  emptyLabel: string
  orders: ProductDemoOrder[]
}

const props = defineProps<{
  error: boolean
  kitchenName: string
  orders: ProductDemoOrder[]
}>()

const stageDefinitions = [
  {
    id: 'incoming',
    label: 'Incoming',
    accent: 'warning',
    emptyLabel: 'Nothing is waiting for acceptance.',
  },
  {
    id: 'queue',
    label: 'Queue',
    accent: 'primary',
    emptyLabel: 'The preparation queue is clear.',
  },
  {
    id: 'pass',
    label: 'Pass',
    accent: 'success',
    emptyLabel: 'No orders are waiting at the pass.',
  },
] as const

const orderStages = computed<ProductDemoOrderStage[]>(() =>
  stageDefinitions.map(stage => ({
    ...stage,
    orders: props.orders.filter(
      order => deriveKitchenOrderBoardStage(order) === stage.id
    ),
  }))
)
const activeOrderCount = computed(() =>
  orderStages.value.reduce(
    (total, stage) => total + stage.orders.length,
    0
  )
)
</script>

<style scoped>
.orders-preview {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.orders-preview :deep(.order-ticket-footer__identity button) {
  display: none;
}

.orders-preview
  :deep([data-order-rail="incoming"] .order-ticket-header__actions) {
  display: none;
}

.orders-preview :deep(.orders-rail > div),
.orders-preview :deep(.order-ticket > div) {
  padding: calc(var(--spacing) * 3);
}
</style>
