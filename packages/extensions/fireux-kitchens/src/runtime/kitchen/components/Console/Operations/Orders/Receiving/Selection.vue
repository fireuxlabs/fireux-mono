<template>
  <section class="receiving-selection" aria-label="Incoming order selection">
    <div class="receiving-selection__scope">
      <span class="receiving-selection__label">Select all</span>
      <UButtonGroup size="sm">
        <UButton
          :color="collectionSelected ? 'primary' : 'neutral'"
          :variant="collectionSelected ? 'solid' : 'outline'"
          :icon="collectionSelected ? 'i-lucide-square-check-big' : 'i-lucide-square'"
          :label="`Collection ${collectionCount}`"
          :disabled="!collectionCount"
          @click="$emit('toggle-collection')"
        />
        <UButton
          :color="scheduledSelected ? 'primary' : 'neutral'"
          :variant="scheduledSelected ? 'solid' : 'outline'"
          :icon="scheduledSelected ? 'i-lucide-square-check-big' : 'i-lucide-square'"
          :label="`Scheduled ${scheduledCount}`"
          :disabled="!scheduledCount"
          @click="$emit('toggle-scheduled')"
        />
      </UButtonGroup>
    </div>

    <div
      class="receiving-selection__actions"
      :class="{ 'receiving-selection__actions--idle': !selectedCount }"
    >
      <UBadge color="neutral" variant="soft" size="lg">
        {{ selectedCount }} selected
      </UBadge>
      <UButtonGroup size="sm">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          label="Clear"
          :tabindex="selectedCount ? undefined : -1"
          @click="$emit('clear')"
        />
        <UButton
          color="primary"
          variant="solid"
          icon="i-lucide-check"
          :label="`Accept ${selectedCount}`"
          :loading="accepting"
          :disabled="!canAccept"
          :tabindex="selectedCount ? undefined : -1"
          @click="$emit('accept')"
        />
      </UButtonGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingSelection' })

defineProps<{
  accepting: boolean
  canAccept: boolean
  collectionCount: number
  collectionSelected: boolean
  scheduledCount: number
  scheduledSelected: boolean
  selectedCount: number
}>()

defineEmits<{
  accept: []
  clear: []
  'toggle-collection': []
  'toggle-scheduled': []
}>()
</script>

<style scoped>
.receiving-selection,
.receiving-selection__scope,
.receiving-selection__actions {
  align-items: center;
  display: flex;
}

.receiving-selection {
  gap: calc(var(--spacing) * 4);
  justify-content: space-between;
  min-height: calc(var(--spacing) * 10);
}

.receiving-selection__scope,
.receiving-selection__actions {
  gap: calc(var(--spacing) * 2);
}

.receiving-selection__label {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  white-space: nowrap;
}

.receiving-selection__actions {
  justify-content: flex-end;
  min-width: calc(var(--spacing) * 52);
}

.receiving-selection__actions--idle {
  pointer-events: none;
  visibility: hidden;
}

@media (max-width: 48rem) {
  .receiving-selection {
    align-items: stretch;
    flex-direction: column;
  }

  .receiving-selection__actions {
    justify-content: flex-start;
    min-width: 0;
  }
}
</style>
