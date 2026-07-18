<template>
  <header class="flex flex-wrap items-center gap-3 border-b border-default pb-3">
    <div class="flex min-w-0 items-center gap-2">
      <h1 class="m-0 text-xl font-bold leading-none text-highlighted">
        Orders
      </h1>
      <UBadge :color="readOnly ? 'neutral' : 'success'" variant="soft" size="sm">
        {{ readOnly ? 'Demo' : 'Live' }}
      </UBadge>
    </div>

    <p class="m-0 min-w-0 flex-1 text-xs text-dimmed">
      {{ visibleCount }} on board
    </p>

    <div class="flex shrink-0 items-center gap-2">
      <span class="size-2.5 rounded-full bg-success" aria-hidden="true" />
      <span class="text-sm font-bold text-highlighted">Pass</span>
      <span class="tabular-nums text-sm font-bold text-muted">{{ passCount }}</span>
      <span
        v-if="selectedCount"
        class="hidden text-xs font-semibold text-success sm:inline"
      >
        {{ selectedCount }} selected
      </span>
      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        icon="i-lucide-undo-2"
        :disabled="!canReturn"
        :loading="returning"
        aria-label="Return selected orders to queue"
        @click="$emit('return')"
      >
        Return
      </UButton>
      <UButton
        size="sm"
        color="success"
        icon="i-lucide-send"
        :disabled="!canSend"
        :loading="sending"
        @click="$emit('send')"
      >
        Send
      </UButton>
    </div>

    <UButton
      v-if="visibleCount"
      size="xs"
      color="error"
      :variant="clearConfirm ? 'soft' : 'ghost'"
      :icon="clearConfirm ? 'i-lucide-trash-2' : 'i-lucide-trash'"
      :disabled="!canClear"
      :aria-label="clearLabel"
      @click="$emit('clear')"
    >
      <span v-if="clearConfirm || clearing">{{ clearLabel }}</span>
    </UButton>

    <UButton
      size="xs"
      color="neutral"
      :variant="endServiceConfirm ? 'soft' : 'ghost'"
      icon="i-lucide-log-out"
      :disabled="!canEndService"
      :loading="endingService"
      :aria-label="endServiceLabel"
      @click="$emit('end-service')"
    >
      {{ endServiceLabel }}
    </UButton>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersToolbar' })

defineProps<{
  readOnly: boolean
  visibleCount: number
  passCount: number
  selectedCount: number
  canReturn: boolean
  returning: boolean
  canSend: boolean
  sending: boolean
  canClear: boolean
  clearConfirm: boolean
  clearing: boolean
  clearLabel: string
  canEndService: boolean
  endServiceConfirm: boolean
  endingService: boolean
  endServiceLabel: string
}>()

defineEmits<{
  return: []
  send: []
  clear: []
  'end-service': []
}>()
</script>
