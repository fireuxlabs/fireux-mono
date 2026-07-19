<template>
  <section
    class="menu-order-collection-status"
    :data-menu-order-id="status?.id || orderId"
    :data-menu-order-status="currentStatus"
    aria-live="polite"
  >
    <span class="menu-order-collection-status__icon" aria-hidden="true">
      <UIcon :name="statusIcon" />
    </span>

    <div class="menu-order-collection-status__copy">
      <p>{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>

    <dl>
      <div>
        <dt>Order</dt>
        <dd>{{ orderNumber || 'Sent' }}</dd>
      </div>
      <div>
        <dt>Collection</dt>
        <dd>{{ collectionLabel }}</dd>
      </div>
      <div>
        <dt>Payment</dt>
        <dd>{{ paymentLabel }}</dd>
      </div>
      <div v-if="handoffInstructions">
        <dt>Collection point</dt>
        <dd>{{ handoffInstructions }}</dd>
      </div>
    </dl>

    <p v-if="statusError" class="menu-order-collection-status__error">
      {{ statusError }} We’ll keep trying.
    </p>

    <p v-if="responseError" class="menu-order-collection-status__error">
      {{ responseError }}
    </p>

    <div
      v-if="changesRequested"
      class="menu-order-collection-status__actions"
    >
      <button
        type="button"
        class="menu-order-collection-status__again"
        :disabled="responding"
        @click="$emit('cancel')"
      >
        Cancel order
      </button>
      <button
        type="button"
        class="menu-order-collection-status__primary"
        :disabled="responding"
        @click="$emit('amend')"
      >
        Amend order
      </button>
    </div>

    <button
      v-if="terminal"
      type="button"
      class="menu-order-collection-status__again"
      @click="$emit('reset')"
    >
      {{ terminalActionLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreatedMenuOrder } from '../../../models/kitchen/menu/menu-ordering.model'
import type { MenuCollectionOrderStatus } from '../../../composables/fireux/menu/order/useMenuCollectionOrder'

const props = defineProps<{
  collectionLabel: string
  customerName?: string
  handoffInstructions?: string
  order: CreatedMenuOrder
  paymentLabel: string
  status: MenuCollectionOrderStatus | null
  statusError?: string
  responseError?: string
  responding?: boolean
}>()
defineEmits<{
  (event: 'cancel'): void
  (event: 'amend'): void
  (event: 'reset'): void
}>()

const currentStatus = computed(() => props.status?.status || props.order.status)
const orderId = computed(() => props.order.id)
const orderNumber = computed(() => props.status?.order_number || props.order.order_number)
const changesRequested = computed(() => currentStatus.value === 'changes_requested')
const terminal = computed(() => ['completed', 'cancelled', 'trashed'].includes(currentStatus.value))
const terminalActionLabel = computed(() =>
  ['cancelled', 'trashed'].includes(currentStatus.value)
    ? 'Acknowledge'
    : 'Start another order'
)
const estimateMinutes = computed(() => Math.max(0, Number(props.status?.estimated_ready_minutes || 0)))
const kitchenNote = computed(() => String(props.status?.kitchen_note || '').trim())
const statusIcon = computed(() => {
  if (currentStatus.value === 'ready') return 'i-lucide-check-check'
  if (currentStatus.value === 'accepted') return 'i-lucide-chef-hat'
  if (changesRequested.value) return 'i-lucide-calendar-clock'
  if (currentStatus.value === 'completed') return 'i-lucide-circle-check-big'
  if (['cancelled', 'trashed'].includes(currentStatus.value)) return 'i-lucide-circle-x'
  return 'i-lucide-clock-3'
})
const eyebrow = computed(() => {
  if (currentStatus.value === 'ready') return 'Ready to collect'
  if (currentStatus.value === 'accepted') return 'Kitchen accepted'
  if (changesRequested.value) {
    return props.customerName ? `Hello ${props.customerName}` : 'Hello'
  }
  if (currentStatus.value === 'completed') return 'Collected'
  if (['cancelled', 'trashed'].includes(currentStatus.value)) return 'Kitchen response'
  return 'Sent to Kitchen'
})
const title = computed(() => {
  if (currentStatus.value === 'ready') return 'Your order is ready'
  if (currentStatus.value === 'accepted') {
    return estimateMinutes.value
      ? `Ready in about ${estimateMinutes.value} minutes`
      : 'Your collection time is confirmed'
  }
  if (changesRequested.value) {
    return kitchenNote.value || 'The Kitchen has requested a change'
  }
  if (currentStatus.value === 'completed') return 'Thank you'
  if (['cancelled', 'trashed'].includes(currentStatus.value)) return 'The Kitchen could not accept this order'
  return 'Waiting for the Kitchen to accept'
})
const description = computed(() => {
  if (currentStatus.value === 'ready') {
    return props.handoffInstructions || 'Please head to the collection point.'
  }
  if (currentStatus.value === 'accepted') return props.collectionLabel
  if (changesRequested.value) {
    return 'Amend the order or cancel it.'
  }
  if (currentStatus.value === 'completed') return 'This collection order is complete.'
  if (['cancelled', 'trashed'].includes(currentStatus.value)) {
    return kitchenNote.value || 'Please contact the Kitchen or try again.'
  }
  return 'Keep this page open. The status updates automatically.'
})
</script>

<style scoped>
.menu-order-collection-status { display: grid; max-width: 42rem; gap: calc(var(--spacing) * 5); margin: 0 auto; padding: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 10)); border: 1px solid color-mix(in srgb, var(--menu-primary) 30%, transparent); border-radius: var(--menu-radius); background: color-mix(in srgb, var(--menu-bg) 94%, var(--menu-primary)); color: var(--menu-text); text-align: center; }
.menu-order-collection-status__icon { display: grid; width: 4rem; height: 4rem; place-items: center; justify-self: center; border-radius: 9999px; background: var(--menu-primary); color: var(--menu-primary-contrast); font-size: 1.75rem; }
.menu-order-collection-status__copy { display: grid; gap: 0.35rem; }
.menu-order-collection-status__copy p, .menu-order-collection-status__copy h2 { margin: 0; }
.menu-order-collection-status__copy > p:first-child { color: var(--menu-primary); font-size: var(--text-xs); font-weight: var(--font-weight-black); letter-spacing: 0.08em; text-transform: uppercase; }
.menu-order-collection-status__copy h2 { color: var(--menu-title); font-family: var(--menu-title-font); font-size: clamp(1.35rem, 5vw, 2rem); }
.menu-order-collection-status__copy > p:last-child { color: var(--menu-muted); }
.menu-order-collection-status dl { display: grid; gap: 0.6rem; margin: 0; text-align: left; }
.menu-order-collection-status dl div { display: flex; justify-content: space-between; gap: calc(var(--spacing) * 4); padding: 0.7rem 0; border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent); }
.menu-order-collection-status dt { color: var(--menu-muted); }
.menu-order-collection-status dd { margin: 0; color: var(--menu-title); font-weight: var(--font-weight-extrabold); text-align: right; }
.menu-order-collection-status__error { margin: 0; color: var(--ui-error); font-size: 0.85rem; }
.menu-order-collection-status__again { justify-self: center; padding: 0.65rem calc(var(--spacing) * 4); border: 1px solid var(--menu-primary); border-radius: var(--menu-radius-control); background: transparent; color: var(--menu-primary); cursor: pointer; font: inherit; font-weight: var(--font-weight-extrabold); }
.menu-order-collection-status__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--spacing) * 3); }
.menu-order-collection-status__primary { padding: 0.65rem calc(var(--spacing) * 4); border: 1px solid var(--menu-primary); border-radius: var(--menu-radius-control); background: var(--menu-primary); color: var(--menu-primary-contrast); cursor: pointer; font: inherit; font-weight: var(--font-weight-extrabold); }
.menu-order-collection-status__actions button:disabled { cursor: wait; opacity: 0.6; }
</style>
