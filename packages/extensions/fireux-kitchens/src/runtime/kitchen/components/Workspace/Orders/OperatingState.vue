<template>
  <section class="orders-operating-state" aria-live="polite">
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <span
          class="size-2 rounded-full"
          :class="isOpen ? 'bg-success' : 'bg-muted'"
          aria-hidden="true"
        />
        <h2 class="text-sm font-semibold text-highlighted">
          {{ statusLabel }}
        </h2>
      </div>
      <p v-if="message" class="mt-1 text-sm text-toned">
        {{ message }}
      </p>
    </div>

    <UButton
      v-if="canOpenNow"
      color="success"
      variant="soft"
      icon="i-lucide-door-open"
      @click="openNow"
    >
      Open now
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersOperatingState' })

const {
  operatingState: { canOpenNow, isOpen, message, openNow, statusLabel },
} = useKitchenOrdersContext()
</script>

<style scoped>
.orders-operating-state {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 2);
}
</style>
