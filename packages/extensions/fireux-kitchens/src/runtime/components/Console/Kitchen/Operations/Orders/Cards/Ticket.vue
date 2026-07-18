<template>
  <div
    class="w-full min-w-0 overflow-hidden rounded-md border bg-default"
    :class="selected
      ? 'border-success ring-2 ring-success/35'
      : prominent
        ? 'border-success/45'
        : 'border-default'"
  >
    <div class="divide-y divide-default">
      <div
        class="flex min-h-10 items-center justify-between gap-2 px-3 text-sm font-semibold text-highlighted"
      >
        <span class="flex min-w-0 items-center gap-2">
          <UIcon :name="headerIcon" class="size-4 shrink-0" />
          <span class="truncate">{{ headerLabel }}</span>
          <span
            v-if="isWaitingForAcceptance"
            class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-dimmed"
            aria-label="Waiting for kitchen acceptance"
          >
            <UIcon
              name="i-lucide-loader-circle"
              class="size-3 animate-spin"
              aria-hidden="true"
            />
            waiting
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <UButton
            v-if="canTouchHeader"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-undo-2"
            :aria-label="headerActionLabel"
            @click.stop="touchHeader"
          />

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

          <span
            v-else-if="statusLabel && !prominent"
            class="text-xs font-medium text-dimmed"
          >
            {{ statusLabel }}
          </span>

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

      <div
        :class="[
          'space-y-1 p-3',
          canTouchBody && 'cursor-pointer hover:bg-muted/40',
        ]"
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
          class="flex items-start gap-2 text-sm"
        >
          <span class="w-6 shrink-0 font-semibold">{{ line.qty }}x</span>
          <span class="min-w-0">
            {{ line.label }}
            <small
              v-if="line.variant && !line.label.includes(line.variant)"
              class="block text-xs text-dimmed"
            >
              {{ line.variant }}
            </small>
            <small
              v-if="line.addOns.length"
              class="block text-xs text-dimmed"
            >
              + {{ line.addOns.join(', ') }}
            </small>
          </span>
        </div>

        <div v-if="!lines.length" class="text-xs italic text-dimmed">
          No items in this order.
        </div>

        <div
          v-if="customerLines.length && !prominent"
          class="mt-3 space-y-0.5 border-t border-default pt-3 text-xs text-dimmed"
        >
          <p
            v-for="line in customerLines"
            :key="line"
            class="m-0"
          >
            {{ line }}
          </p>
        </div>
      </div>

      <div class="flex min-h-10 items-center justify-between gap-2 px-3 text-xs font-medium text-dimmed">
        <span class="min-w-0 truncate">
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
    </div>
  </div>
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
