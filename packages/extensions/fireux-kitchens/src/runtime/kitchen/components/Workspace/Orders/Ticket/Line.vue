<template>
  <div class="order-ticket-line">
    <UBadge color="primary" variant="soft" size="sm"> {{ line.qty }}× </UBadge>
    <span class="order-ticket-line__content">
      {{ line.label }}
      <small
        v-if="line.variant && !line.label.includes(line.variant)"
        class="order-ticket-line__option"
      >
        {{ line.variant }}
      </small>
      <small v-if="line.addOns.length" class="order-ticket-line__option">
        + {{ line.addOns.join(', ') }}
      </small>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { KitchenOrderTicketLine } from '../../../../composables/workspace/orders/useKitchenOrderTicket'

defineOptions({ name: 'WorkspaceKitchenOrdersTicketLine' })

defineProps<{
  line: KitchenOrderTicketLine
}>()
</script>

<style scoped>
.order-ticket-line {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
}

.order-ticket-line + .order-ticket-line {
  margin-top: var(--spacing);
}

.order-ticket-line__content {
  min-width: 0;
}

.order-ticket-line__option {
  display: block;
  color: var(--ui-text-muted);
}
</style>
