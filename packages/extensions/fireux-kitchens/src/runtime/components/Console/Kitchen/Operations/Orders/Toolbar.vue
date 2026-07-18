<template>
  <Teleport to="#kitchen-orders-actions">
    <div class="orders-toolbar__actions">
        <UBadge color="success" variant="soft" size="sm">
          Pass {{ passCount }}
        </UBadge>
        <UBadge
          v-if="selectedCount"
          color="success"
          variant="subtle"
          size="sm"
        >
          {{ selectedCount }} selected
        </UBadge>
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
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersToolbar' })

defineProps<{
  passCount: number
  selectedCount: number
  canSend: boolean
  sending: boolean
  canEndService: boolean
  endServiceConfirm: boolean
  endingService: boolean
  endServiceLabel: string
}>()

defineEmits<{
  send: []
  'end-service': []
}>()
</script>

<style scoped>
.orders-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
