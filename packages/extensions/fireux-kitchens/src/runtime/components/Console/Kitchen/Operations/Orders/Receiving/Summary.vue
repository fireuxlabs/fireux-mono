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
      <UBadge v-if="timingLabel" color="primary" variant="soft" size="sm">
        {{ timingLabel }}
      </UBadge>
      <UBadge color="neutral" variant="soft" size="sm">
        {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
      </UBadge>
    </span>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingSummary' })

defineProps<{
  icon: string
  itemCount: number
  orderLabel: string
  timingLabel?: string
  title: string
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
  font-size: var(--text-xs);
}

.receiving-summary__actions {
  flex: none;
  flex-wrap: wrap;
}
</style>
