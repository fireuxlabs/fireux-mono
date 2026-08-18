<template>
  <div class="order-ticket-header">
    <span class="order-ticket-header__identity">
      <UIcon :name="icon" />
      <strong class="order-ticket-header__label">{{ label }}</strong>
      <UBadge
        v-if="waiting"
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-loader-circle"
        aria-label="Waiting for kitchen acceptance"
      >
        Waiting
      </UBadge>
    </span>

    <span class="order-ticket-header__actions">
      <UButton
        v-if="canReturn"
        size="xs"
        color="neutral"
        variant="soft"
        icon="i-lucide-undo-2"
        class="order-ticket-header__return"
        :aria-label="returnLabel"
        @click.stop="$emit('return')"
      >
        <span v-if="prominent">{{ returnLabel }}</span>
      </UButton>

      <UButton
        v-if="showStatusAction"
        :size="prominent ? 'sm' : 'xs'"
        :color="prominent ? 'success' : 'neutral'"
        :variant="prominent ? 'solid' : 'ghost'"
        :disabled="!canUseStatusAction || statusActionPending"
        :loading="statusActionPending"
        :aria-label="statusActionAriaLabel || statusActionLabel"
        @click.stop="$emit('status')"
      >
        {{ statusActionLabel }}
      </UButton>

      <UBadge
        v-else-if="statusLabel && !prominent"
        color="neutral"
        variant="soft"
        size="sm"
      >
        {{ statusLabel }}
      </UBadge>

      <UButton
        v-if="trashMode"
        size="xs"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        :disabled="!canTrash"
        aria-label="Move order to trash"
        @click.stop="$emit('trash')"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersTicketHeader' })

defineProps<{
  canReturn: boolean
  canTrash: boolean
  canUseStatusAction: boolean
  icon: string
  label: string
  prominent: boolean
  returnLabel: string
  showStatusAction: boolean
  statusActionAriaLabel: string
  statusActionLabel: string
  statusActionPending: boolean
  statusLabel: string
  trashMode: boolean
  waiting: boolean
}>()

defineEmits<{
  return: []
  status: []
  trash: []
}>()
</script>

<style scoped>
.order-ticket-header,
.order-ticket-header__identity,
.order-ticket-header__actions {
  display: flex;
  align-items: center;
}

.order-ticket-header {
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
}

.order-ticket-header__identity {
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}

.order-ticket-header__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-ticket-header__actions {
  flex: none;
  gap: calc(var(--spacing) * 2);
}

.order-ticket-header__return {
  color: var(--order-ticket-reading-color);
  background: color-mix(
    in srgb,
    var(--order-ticket-reading-color) 14%,
    transparent
  );
}

.order-ticket-header__return:hover {
  background: color-mix(
    in srgb,
    var(--order-ticket-reading-color) 22%,
    transparent
  );
}
</style>
