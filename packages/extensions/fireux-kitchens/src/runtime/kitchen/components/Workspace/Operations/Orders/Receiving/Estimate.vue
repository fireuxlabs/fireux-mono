<template>
  <section class="receiving-estimate">
    <header class="receiving-estimate__header">
      <span class="receiving-estimate__copy">
        <span>{{ label }}</span>
        <strong>{{ minutes }} minutes</strong>
      </span>
      <UIcon name="i-lucide-clock-3" aria-hidden="true" />
    </header>

    <div
      class="receiving-estimate__adjustment"
      aria-label="Adjust preparation time"
    >
      <UButton
        size="lg"
        color="neutral"
        variant="soft"
        icon="i-lucide-minus"
        label="5"
        :disabled="!canInteract || !orderId"
        aria-label="Reduce estimate by five minutes"
        @click="nudge(-5)"
      />

      <strong>{{ minutes }}</strong>

      <UButton
        size="lg"
        color="neutral"
        variant="soft"
        icon="i-lucide-plus"
        label="5"
        :disabled="!canInteract || !orderId"
        aria-label="Increase estimate by five minutes"
        @click="nudge(5)"
      />
    </div>

    <UButton
      size="xl"
      color="primary"
      block
      icon="i-lucide-check"
      :disabled="!canInteract || !orderId"
      :loading="accepting"
      :label="`Accept · ${minutes} min`"
      @click="accept"
    />
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    accepting?: boolean
    canInteract?: boolean
    label?: string
    minutes: number
    orderId: string
  }>(),
  {
    accepting: false,
    canInteract: true,
    label: 'Cooking time',
  }
)
const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

function accept() {
  if (!props.canInteract || !props.orderId) return
  emit('accept', {
    id: props.orderId,
    estimatedMinutes: props.minutes,
  })
}

function nudge(amount: number) {
  if (!props.canInteract || !props.orderId) return
  emit('nudge-estimate', {
    id: props.orderId,
    amount,
  })
}
</script>

<style scoped>
.receiving-estimate {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.receiving-estimate__header,
.receiving-estimate__adjustment {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.receiving-estimate__header {
  color: var(--ui-text-muted);
}

.receiving-estimate__header > svg {
  font-size: var(--text-2xl);
}

.receiving-estimate__copy {
  display: grid;
}

.receiving-estimate__copy span {
  font-size: var(--text-xs);
}

.receiving-estimate__copy strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-2xl);
}

.receiving-estimate__adjustment {
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius);
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2);
}

.receiving-estimate__adjustment > strong {
  font-size: var(--text-xl);
}
</style>
