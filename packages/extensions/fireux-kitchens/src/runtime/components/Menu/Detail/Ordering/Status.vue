<template>
  <aside
    v-if="order.awaitingAcceptance"
    class="menu-order-status"
    role="status"
    aria-live="polite"
  >
    <span
      v-if="!order.accepted"
      class="menu-order-status__spinner"
      aria-hidden="true"
    />
    <UIcon
      v-else
      name="i-lucide-circle-check"
      class="menu-order-status__accepted"
      aria-hidden="true"
    />
    <span>
      <MenuDetailOrderingCustomerPill />
      <strong>{{ order.accepted ? 'Order accepted' : 'Waiting for order to be accepted' }}</strong>
      <small>{{ customerStatusMessage }}</small>
      <ol class="menu-order-status__steps">
        <li class="menu-order-status__step menu-order-status__step--done">
          Sent
        </li>
        <li class="menu-order-status__step menu-order-status__step--done">
          Received
        </li>
        <li
          class="menu-order-status__step"
          :class="{ 'menu-order-status__step--done': order.accepted }"
        >
          Kitchen accepted
        </li>
      </ol>
      <small v-if="orderReference" class="menu-order-status__reference">
        Reference {{ orderReference }}
      </small>
    </span>

    <div class="menu-order-status__actions">
      <NuxtLink
        v-if="order.accepted"
        class="menu-order-status__close"
        to="/customers"
      >
        Close
      </NuxtLink>
    </div>
  </aside>

  <aside
    v-else-if="order.sentOrder"
    class="menu-order-status"
    role="status"
    aria-live="polite"
  >
    <UIcon
      name="i-lucide-circle-check"
      class="menu-order-status__accepted"
      aria-hidden="true"
    />
    <span>
      <MenuDetailOrderingCustomerPill />
      <strong>Order sent</strong>
      <small>{{ customerStatusMessage }}</small>
      <small v-if="orderReference" class="menu-order-status__reference">
        Reference {{ orderReference }}
      </small>
    </span>

    <div class="menu-order-status__actions">
      <button
        type="button"
        class="menu-order-status__close"
        @click="$emit('clear')"
      >
        Close
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelState } from './types'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'clear'): void
}>()

const orderReference = computed(() =>
  String(props.order.sentOrder?.order_number || '').trim()
)
const customerName = computed(() =>
  String(props.order.sentOrder?.receipt?.customer?.name || '').trim()
)
const shortAddress = computed(() => {
  const address = String(props.order.sentOrder?.receipt?.customer?.address || '').trim()
  if (!address) return ''

  return address.split(',').slice(0, 2).join(', ')
})
const customerStatusMessage = computed(() => {
  if (props.order.accepted) {
    return shortAddress.value
      ? `Accepted. We are preparing delivery to ${shortAddress.value}.`
      : 'Accepted. The kitchen is preparing your order.'
  }

  if (shortAddress.value) {
    return `We have your delivery for ${shortAddress.value}. Waiting for the kitchen to accept it.`
  }

  if (customerName.value) {
    return `We have your order, ${customerName.value}. Waiting for the kitchen to accept it.`
  }

  return 'We have your order. Waiting for the kitchen to accept it.'
})
</script>
