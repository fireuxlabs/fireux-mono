<template>
  <UCard
    class="order-ticket"
    :class="{
      'order-ticket--prominent': prominent,
      'order-ticket--selected': selected,
    }"
  >
    <template #header>
      <div class="order-ticket__header">
        <span class="order-ticket__identity">
          <UIcon :name="headerIcon" />
          <strong class="order-ticket__header-label">{{ headerLabel }}</strong>
          <UBadge
            v-if="isWaitingForAcceptance"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-loader-circle"
            aria-label="Waiting for kitchen acceptance"
          >
            Waiting
          </UBadge>
        </span>
        <span class="order-ticket__actions">
          <UButton
            v-if="canTouchHeader"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-undo-2"
            :aria-label="headerActionLabel"
            @click.stop="touchHeader"
          >
            <span v-if="prominent">{{ headerActionLabel }}</span>
          </UButton>

          <UButton
            v-if="canShowStatusAction"
            :size="prominent ? 'sm' : 'xs'"
            :color="prominent ? 'success' : 'neutral'"
            :variant="prominent ? 'solid' : 'ghost'"
            :disabled="!canUseStatusAction || statusActionPending"
            :loading="statusActionPending"
            :aria-label="statusActionAriaLabel || statusActionLabel"
            @click.stop="touchStatus"
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
            :disabled="!interactive || !orderId"
            aria-label="Move order to trash"
            @click.stop="trashOrder"
          />
        </span>
      </div>
    </template>

    <div
      class="order-ticket__body"
      :class="{ 'order-ticket__body--interactive': canTouchBody }"
      :role="canTouchBody ? 'button' : undefined"
      :tabindex="canTouchBody ? 0 : undefined"
      :aria-label="bodyActionLabel || undefined"
      :aria-pressed="canTouchBody ? selected : undefined"
      @click="touchBody"
      @keydown.enter.prevent="touchBody"
      @keydown.space.prevent="touchBody"
    >
      <div
        v-for="line in lines"
        :key="line.id"
        class="order-ticket__line"
      >
        <UBadge color="primary" variant="soft" size="sm">
          {{ line.qty }}×
        </UBadge>
        <span class="order-ticket__line-content">
          {{ line.label }}
          <small
            v-if="line.variant && !line.label.includes(line.variant)"
            class="order-ticket__option"
          >
            {{ line.variant }}
          </small>
          <small
            v-if="line.addOns.length"
            class="order-ticket__option"
          >
            + {{ line.addOns.join(', ') }}
          </small>
        </span>
      </div>

      <div v-if="!lines.length" class="order-ticket__empty">
        No items in this order.
      </div>

      <div
        v-if="customerLines.length && !prominent"
        class="order-ticket__customer"
      >
        <USeparator />
        <p
          v-for="line in customerLines"
          :key="line"
          class="order-ticket__customer-line"
        >
          {{ line }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="order-ticket__footer">
        <span class="order-ticket__order-label">
          {{ orderLabel }}
        </span>

        <UButton
          v-if="!prominent"
          type="button"
          size="xs"
          color="neutral"
          variant="soft"
          :disabled="!orderId"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :aria-label="copied ? 'Order copied' : 'Copy order'"
          @click.stop="copyTicket"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import {
  useKitchenOrderTicket,
  type KitchenOrderTicketProps,
} from '../../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderTicket'

const props = withDefaults(
  defineProps<KitchenOrderTicketProps>(),
  {
    trashMode: false,
    interactive: true,
    prominent: false,
    selected: false,
    headerActionLabel: '',
    bodyActionLabel: '',
    statusActionLabel: '',
    statusActionAriaLabel: '',
    statusActionPending: false,
  }
)
const emit = defineEmits<{
  (event: 'trash', id: string): void
  (event: 'touch-header', id: string): void
  (event: 'touch-body', id: string): void
  (event: 'touch-status', id: string): void
}>()

const {
  canShowStatusAction,
  canUseStatusAction,
  canTouchBody,
  canTouchHeader,
  copied,
  copyTicket,
  customerLines,
  headerIcon,
  headerLabel,
  isWaitingForAcceptance,
  lines,
  orderId,
  orderLabel,
  statusLabel,
  touchBody,
  touchHeader,
  touchStatus,
  trashOrder,
} = useKitchenOrderTicket(props, emit)
</script>

<style scoped>
.order-ticket {
  width: 100%;
  min-width: 0;
}

.order-ticket--prominent {
  outline: 1px solid color-mix(in srgb, var(--ui-success) 45%, transparent);
}

.order-ticket--selected {
  outline: 3px solid color-mix(in srgb, var(--ui-success) 45%, transparent);
}

.order-ticket__header,
.order-ticket__identity,
.order-ticket__actions,
.order-ticket__footer {
  display: flex;
  align-items: center;
}

.order-ticket__header {
  justify-content: space-between;
  gap: 0.5rem;
}

.order-ticket__identity {
  min-width: 0;
  gap: 0.5rem;
}

.order-ticket__header-label,
.order-ticket__order-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-ticket__actions {
  flex: none;
  gap: 0.5rem;
}

.order-ticket__empty,
.order-ticket__customer {
  color: var(--ui-text-dimmed);
  font-size: 0.75rem;
}

.order-ticket__body--interactive {
  cursor: pointer;
}

.order-ticket__body--interactive:hover {
  background: color-mix(in srgb, var(--ui-bg-muted) 40%, transparent);
}

.order-ticket__line {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.order-ticket__line + .order-ticket__line {
  margin-top: 0.25rem;
}

.order-ticket__line-content,
.order-ticket__order-label {
  min-width: 0;
}

.order-ticket__option {
  display: block;
  color: var(--ui-text-muted);
}

.order-ticket__empty {
  font-style: italic;
}

.order-ticket__customer {
  margin-top: 0.75rem;
}

.order-ticket__customer-line {
  margin-bottom: 0;
}

.order-ticket__footer {
  justify-content: space-between;
  gap: 0.5rem;
}

.order-ticket--prominent .order-ticket__footer {
  font-weight: 700;
}
</style>
