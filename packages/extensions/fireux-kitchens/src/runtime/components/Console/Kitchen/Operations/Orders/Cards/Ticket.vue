<template>
  <div
    ref="ticketFrame"
    class="order-ticket-frame"
    :class="{
      'order-ticket-frame--expanded': linesExpanded,
    }"
    :style="linesExpanded && collapsedHeight
      ? { height: `${collapsedHeight}px` }
      : undefined"
  >
    <UCard
      class="order-ticket"
      :ui="{
        body: 'order-ticket__content',
        footer: 'order-ticket__footer-slot',
      }"
      :class="{
        'order-ticket--expanded': linesExpanded,
        'order-ticket--interactive': canTouchBody,
        'order-ticket--prominent': prominent,
        'order-ticket--selected': selected,
      }"
      :role="canTouchBody ? 'button' : undefined"
      :tabindex="canTouchBody ? 0 : undefined"
      :aria-label="bodyActionLabel || undefined"
      :aria-pressed="canTouchBody ? selected : undefined"
      @click="touchBody"
      @keydown.enter.self.prevent="touchBody"
      @keydown.space.self.prevent="touchBody"
    >
      <template #header>
        <ConsoleKitchenOperationsOrdersCardsTicketHeader
          :icon="headerIcon"
          :label="headerLabel"
          :waiting="isWaitingForAcceptance"
          :can-return="canTouchHeader"
          :return-label="headerActionLabel"
          :show-status-action="canShowStatusAction"
          :can-use-status-action="canUseStatusAction"
          :status-action-label="statusActionLabel"
          :status-action-aria-label="statusActionAriaLabel"
          :status-action-pending="statusActionPending"
          :status-label="statusLabel"
          :trash-mode="trashMode"
          :can-trash="interactive && Boolean(orderId)"
          :prominent="prominent"
          @return="touchHeader"
          @status="touchStatus"
          @trash="trashOrder"
        />
      </template>

      <ConsoleKitchenOperationsOrdersCardsTicketBody
        :lines="visibleLines"
        :has-lines="Boolean(lines.length)"
        :can-toggle-lines="canToggleLines"
        :expanded="linesExpanded"
        :hidden-line-count="hiddenLineCount"
        :customer-lines="customerLines"
        :show-customer-details="showCustomerDetails"
        @toggle="toggleTicketExpansion"
      />

      <template #footer>
        <ConsoleKitchenOperationsOrdersCardsTicketFooter
          :expanded="linesExpanded"
          :order-label="orderLabel"
          :placed-time-label="placedTimeLabel"
          :prominent="prominent"
          @print="printTicket"
        />
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  useKitchenOrderTicket,
  type KitchenOrderTicketProps,
} from '../../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderTicket'
import { printKitchenOrderTicket } from '../../../../../../composables/fireux/console/kitchen/operations/Orders/utils/useKitchenOrderReceiptPrint'

const props = withDefaults(
  defineProps<KitchenOrderTicketProps>(),
  {
    trashMode: false,
    interactive: true,
    prominent: false,
    selected: false,
    showCustomerDetails: true,
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
  canToggleLines,
  canUseStatusAction,
  canTouchBody,
  canTouchHeader,
  customerLines,
  headerIcon,
  headerLabel,
  hiddenLineCount,
  isWaitingForAcceptance,
  lines,
  linesExpanded,
  orderId,
  orderLabel,
  placedTimeLabel,
  statusLabel,
  touchBody,
  touchHeader,
  touchStatus,
  toggleLines,
  trashOrder,
  visibleLines,
} = useKitchenOrderTicket(props, emit)

const ticketFrame = ref<HTMLElement | null>(null)
const collapsedHeight = ref(0)

async function toggleTicketExpansion() {
  if (!linesExpanded.value) {
    collapsedHeight.value = ticketFrame.value?.offsetHeight || 0
    toggleLines()
    return
  }

  toggleLines()
  await nextTick()
  collapsedHeight.value = 0
}

function printTicket() {
  if (!printKitchenOrderTicket(props.order) || !linesExpanded.value) return
  void toggleTicketExpansion()
}
</script>

<style scoped>
.order-ticket-frame {
  --order-ticket-reading-color: var(--color-violet-500, #8b5cf6);
  --order-ticket-selected-color: var(--color-amber-400, #fbbf24);

  position: relative;
  width: 100%;
  min-width: 0;
}

.order-ticket-frame--expanded {
  z-index: 20;
}

.order-ticket {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.order-ticket--expanded {
  position: absolute;
  z-index: 30;
  top: 0;
  left: 0;
  height: auto;
  max-height: min(80vh, 48rem);
  overflow-y: auto;
  background: color-mix(
    in srgb,
    var(--order-ticket-reading-color) 12%,
    var(--ui-bg)
  );
  outline: 2px solid color-mix(
    in srgb,
    var(--order-ticket-reading-color) 60%,
    transparent
  );
}

:deep(.order-ticket__content) {
  flex: 1 1 auto;
}

:deep(.order-ticket__footer-slot) {
  flex: none;
}

.order-ticket--prominent {
  outline: 1px solid color-mix(in srgb, var(--ui-success) 45%, transparent);
}

.order-ticket--selected {
  background: color-mix(
    in srgb,
    var(--order-ticket-selected-color) 12%,
    var(--ui-bg)
  );
  outline: 3px solid color-mix(
    in srgb,
    var(--ui-success) 45%,
    transparent
  );
}

.order-ticket--interactive {
  cursor: pointer;
}

.order-ticket--interactive:not(.order-ticket--expanded):not(.order-ticket--selected):hover {
  background: color-mix(in srgb, var(--ui-bg-muted) 40%, transparent);
}

</style>
