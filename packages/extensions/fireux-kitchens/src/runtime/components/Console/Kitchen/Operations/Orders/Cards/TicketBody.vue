<template>
  <div class="order-ticket-body">
    <ConsoleKitchenOperationsOrdersCardsTicketLine
      v-for="line in lines"
      :key="line.id"
      :line="line"
    />

    <UButton
      v-if="canToggleLines"
      type="button"
      size="xs"
      color="neutral"
      variant="soft"
      block
      class="order-ticket-body__expand"
      :icon="expanded ? 'i-lucide-chevrons-up' : 'i-lucide-chevrons-down'"
      :label="expanded ? 'Show less' : `Show ${hiddenLineCount} more`"
      @click.stop="$emit('toggle')"
    />

    <div v-if="!hasLines" class="order-ticket-body__empty">
      No items in this order.
    </div>

    <div
      v-if="customerLines.length && showCustomerDetails"
      class="order-ticket-body__customer"
    >
      <USeparator />
      <p
        v-for="line in customerLines"
        :key="line"
        class="order-ticket-body__customer-line"
      >
        {{ line }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KitchenOrderTicketLine } from '../../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderTicket'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersCardsTicketBody' })

defineProps<{
  canToggleLines: boolean
  customerLines: string[]
  expanded: boolean
  hasLines: boolean
  hiddenLineCount: number
  lines: KitchenOrderTicketLine[]
  showCustomerDetails: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.order-ticket-body__expand {
  color: var(--order-ticket-reading-color);
  background: color-mix(
    in srgb,
    var(--order-ticket-reading-color) 14%,
    transparent
  );
}

.order-ticket-body__expand:hover {
  background: color-mix(
    in srgb,
    var(--order-ticket-reading-color) 22%,
    transparent
  );
}

.order-ticket-body__empty,
.order-ticket-body__customer {
  color: var(--ui-text-dimmed);
  font-size: 0.75rem;
}

.order-ticket-body__empty {
  font-style: italic;
}

.order-ticket-body__customer {
  margin-top: 0.75rem;
}

.order-ticket-body__customer-line {
  margin-bottom: 0;
}
</style>
