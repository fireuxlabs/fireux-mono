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
      :disabled="!canInteract"
      @input="setEstimate(($event.target as HTMLInputElement).value)"
    >

    <div class="grid grid-cols-[2.25rem_1fr_2.25rem] gap-2">
      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        icon="i-lucide-minus"
        :disabled="!canInteract || !orderId"
        aria-label="Reduce estimate by five minutes"
        @click="nudge(-5)"
      />

      <UButton
        color="primary"
        block
        :disabled="!canInteract || !orderId"
        :loading="accepting"
        @click="accept"
      >
        Accept · {{ minutes }} min
      </UButton>

      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        icon="i-lucide-plus"
        :disabled="!canInteract || !orderId"
        aria-label="Increase estimate by five minutes"
        @click="nudge(5)"
      />
    </div>
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

function setEstimate(value: unknown) {
  if (!props.canInteract || !props.orderId) return
  emit('set-estimate', {
    id: props.orderId,
    minutes: Number(value),
  })
}
</script>
