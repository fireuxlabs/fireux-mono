<template>
  <section class="receiving-scheduled">
    <header class="receiving-scheduled__header">
      <span class="receiving-scheduled__icon">
        <UIcon :name="icon" aria-hidden="true" />
      </span>
      <span class="receiving-scheduled__copy">
        <span>{{ label }}</span>
        <strong>{{ dateTimeLabel }}</strong>
        <small v-if="detail">{{ detail }}</small>
      </span>
    </header>

    <UButton
      size="xl"
      color="primary"
      block
      icon="i-lucide-check"
      :disabled="!canAccept"
      :loading="accepting"
      :label="canAccept ? acceptLabel : waitingLabel"
      @click="$emit('accept')"
    />
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingScheduled' })

withDefaults(
  defineProps<{
    acceptLabel: string
    accepting?: boolean
    canAccept: boolean
    dateTimeLabel: string
    detail?: string
    icon?: string
    label: string
    waitingLabel?: string
  }>(),
  {
    accepting: false,
    detail: '',
    icon: 'i-lucide-calendar-clock',
    waitingLabel: 'Waiting for requested time',
  }
)

defineEmits<{ accept: [] }>()
</script>

<style scoped>
.receiving-scheduled {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.receiving-scheduled__header {
  align-items: center;
  display: flex;
  gap: calc(var(--spacing) * 3);
}

.receiving-scheduled__icon {
  align-items: center;
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius);
  color: var(--ui-primary);
  display: flex;
  flex: none;
  font-size: var(--text-2xl);
  justify-content: center;
  padding: calc(var(--spacing) * 3);
}

.receiving-scheduled__copy {
  display: grid;
  min-width: 0;
}

.receiving-scheduled__copy span,
.receiving-scheduled__copy small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.receiving-scheduled__copy strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
}
</style>
