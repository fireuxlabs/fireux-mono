<template>
  <header class="receiving-summary">
    <span class="receiving-summary__identity">
      <UIcon v-if="icon" :name="icon" aria-hidden="true" />
      <span class="receiving-summary__copy">
        <strong class="receiving-summary__title">{{ title }}</strong>
        <span class="receiving-summary__order">{{ orderLabel }}</span>
      </span>
    </span>

    <span class="receiving-summary__actions">
      <UButton
        v-if="acceptLabel"
        size="sm"
        color="primary"
        :icon="acceptIcon"
        :label="acceptLabel"
        :disabled="!canAccept"
        :loading="accepting"
        @click="$emit('accept')"
      />
      <UBadge color="neutral" variant="soft" size="sm">
        {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
      </UBadge>
      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        :icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        :label="open ? 'Close' : 'Review'"
        @click="$emit('toggle')"
      />
    </span>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingSummary' })

defineProps<{
  acceptIcon?: string
  acceptLabel?: string
  accepting: boolean
  canAccept: boolean
  icon: string
  itemCount: number
  open: boolean
  orderLabel: string
  title: string
}>()

defineEmits<{
  accept: []
  toggle: []
}>()
</script>

<style scoped>
.receiving-summary,
.receiving-summary__identity,
.receiving-summary__actions,
.receiving-summary__copy {
  display: flex;
}

.receiving-summary {
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.receiving-summary__identity,
.receiving-summary__actions {
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.receiving-summary__identity,
.receiving-summary__copy {
  min-width: 0;
}

.receiving-summary__copy {
  flex-direction: column;
}

.receiving-summary__title,
.receiving-summary__order {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.receiving-summary__order {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
}

.receiving-summary__actions {
  flex: none;
  flex-wrap: wrap;
}
</style>
