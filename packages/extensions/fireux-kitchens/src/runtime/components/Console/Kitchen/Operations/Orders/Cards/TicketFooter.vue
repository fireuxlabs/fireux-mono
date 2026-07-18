<template>
  <div
    class="order-ticket-footer"
    :class="{ 'order-ticket-footer--prominent': prominent }"
  >
    <span class="order-ticket-footer__identity">
      <UButton
        size="xs"
        :color="expanded ? 'primary' : 'neutral'"
        variant="soft"
        icon="i-lucide-printer"
        :aria-label="`Print ${orderLabel}`"
        @click.stop="$emit('print')"
      />
      <span class="order-ticket-footer__order-label">
        {{ orderLabel }}
      </span>
    </span>

    <span v-if="placedTimeLabel" class="order-ticket-footer__placed-time">
      <UIcon name="i-lucide-clock-3" />
      <span>{{ placedTimeLabel }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersCardsTicketFooter' })

defineProps<{
  expanded: boolean
  orderLabel: string
  placedTimeLabel: string
  prominent: boolean
}>()

defineEmits<{
  print: []
}>()
</script>

<style scoped>
.order-ticket-footer,
.order-ticket-footer__identity,
.order-ticket-footer__placed-time {
  display: flex;
  align-items: center;
}

.order-ticket-footer {
  min-width: 0;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 0.5rem;
  white-space: nowrap;
}

.order-ticket-footer--prominent {
  font-weight: 700;
}

.order-ticket-footer__identity {
  min-width: 0;
  gap: 0.375rem;
}

.order-ticket-footer__order-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-ticket-footer__placed-time {
  flex: none;
  gap: 0.25rem;
}
</style>
