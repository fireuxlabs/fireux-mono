<template>
  <section class="grid gap-3">
    <div class="flex items-center justify-between gap-3 text-sm">
      <span class="font-semibold text-muted">
        {{ label }}
      </span>
      <strong class="text-base font-black text-highlighted">
        {{ minutes }} min
      </strong>
    </div>

    <input
      class="w-full"
      type="range"
      min="5"
      max="90"
      step="5"
      :value="minutes"
      @input="setEstimate(($event.target as HTMLInputElement).value)"
    >

    <div class="grid grid-cols-[auto_1fr_auto] gap-2">
      <UButton
        color="neutral"
        variant="soft"
        :disabled="!orderId"
        @click="nudge(-5)"
      >
        -5
      </UButton>

      <UButton
        color="primary"
        block
        :disabled="!orderId"
        :loading="accepting"
        @click="accept"
      >
        Accept · {{ minutes }} min
      </UButton>

      <UButton
        color="neutral"
        variant="soft"
        :disabled="!orderId"
        @click="nudge(5)"
      >
        +5
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    accepting?: boolean
    label?: string
    minutes: number
    orderId: string
  }>(),
  {
    accepting: false,
    label: 'Cooking time',
  }
)
const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

function accept() {
  if (!props.orderId) return
  emit('accept', {
    id: props.orderId,
    estimatedMinutes: props.minutes,
  })
}

function nudge(amount: number) {
  if (!props.orderId) return
  emit('nudge-estimate', {
    id: props.orderId,
    amount,
  })
}

function setEstimate(value: unknown) {
  if (!props.orderId) return
  emit('set-estimate', {
    id: props.orderId,
    minutes: Number(value),
  })
}
</script>
