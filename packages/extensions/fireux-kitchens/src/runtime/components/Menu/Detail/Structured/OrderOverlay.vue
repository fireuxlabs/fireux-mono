<template>
  <div class="menu-order-overlay">
    <aside
      v-if="order.awaitingAcceptance"
      class="menu-order-waiting"
      role="status"
      aria-live="polite"
    >
      <span
        v-if="!order.accepted"
        class="menu-order-waiting__spinner"
        aria-hidden="true"
      />
      <UIcon
        v-else
        name="i-lucide-circle-check"
        class="menu-order-waiting__accepted"
        aria-hidden="true"
      />
      <span>
        <MenuDetailOrderingCustomerPill />
        <strong>{{ order.accepted ? 'Order accepted' : 'Waiting for order to be accepted' }}</strong>
        <small>{{ customerStatusMessage }}</small>
        <ol class="menu-order-waiting__steps">
          <li class="menu-order-waiting__step menu-order-waiting__step--done">
            Sent
          </li>
          <li class="menu-order-waiting__step menu-order-waiting__step--done">
            Received
          </li>
          <li
            class="menu-order-waiting__step"
            :class="{ 'menu-order-waiting__step--done': order.accepted }"
          >
            Kitchen accepted
          </li>
        </ol>
        <small v-if="orderReference" class="menu-order-waiting__reference">
          Reference {{ orderReference }}
        </small>
      </span>

      <div class="menu-order-waiting__actions">
        <NuxtLink
          v-if="order.accepted"
          class="menu-order-waiting__close"
          to="/customers"
        >
          Close
        </NuxtLink>
      </div>
    </aside>

    <aside
      v-else-if="order.sentOrder"
      class="menu-order-waiting"
      role="status"
      aria-live="polite"
    >
      <UIcon
        name="i-lucide-circle-check"
        class="menu-order-waiting__accepted"
        aria-hidden="true"
      />
      <span>
        <MenuDetailOrderingCustomerPill />
        <strong>Order sent</strong>
        <small>{{ customerStatusMessage }}</small>
        <small v-if="orderReference" class="menu-order-waiting__reference">
          Reference {{ orderReference }}
        </small>
      </span>

      <div class="menu-order-waiting__actions">
        <button
          type="button"
          class="menu-order-waiting__close"
          @click="$emit('clear')"
        >
          Close
        </button>
      </div>
    </aside>

    <MenuDetailOrderingBasket
      v-else-if="!order.funnelOpen"
      :quantity="order.quantity"
      :items="order.items"
      :pending="order.pending"
      :action-label="order.actionLabel"
      @clear="$emit('clear')"
      @place="$emit('openFunnel')"
    />

    <MenuDetailOrderingFunnelPanel
      v-else
      :order-type="order.orderType"
      :menu-id="order.menuId"
      :kitchen-slug="order.kitchenSlug"
      :policy="order.policy"
      :pending="order.pending"
      :selection="order.selection"
      @close="$emit('closeFunnel')"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderCustomer } from '../../../../models/order.model'
import type { MenuStructuredOrderOverlayState } from './types'

const props = defineProps<{
  order: MenuStructuredOrderOverlayState
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'closeFunnel'): void
  (event: 'openFunnel'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
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

<style scoped>
.menu-order-overlay {
  position: fixed;
  z-index: 30;
  right: 0;
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: 0;
  display: grid;
  justify-items: center;
  padding-inline: 0.5rem;
  pointer-events: none;
}

.menu-order-overlay > * {
  pointer-events: auto;
}

.menu-order-waiting {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  width: min(44rem, calc(100% - 1rem));
  min-height: min(34rem, calc(100svh - 2rem));
  max-height: min(38rem, calc(100svh - 2rem));
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.35rem);
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.35rem;
  background: color-mix(in srgb, var(--menu-bg) 94%, transparent);
  color: var(--menu-text);
  box-shadow: 0 1.25rem 4rem color-mix(in srgb, var(--menu-text) 18%, transparent);
  overflow: auto;
  text-align: left;
  backdrop-filter: blur(20px);
}

.menu-order-waiting__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-self: start;
  justify-content: end;
}

.menu-order-waiting__close {
  appearance: none;
  align-self: start;
  padding: 0.55rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}

.menu-order-waiting__close:hover {
  background: color-mix(in srgb, var(--menu-primary) 14%, var(--menu-bg));
}

.menu-order-waiting strong,
.menu-order-waiting small {
  display: block;
}

.menu-order-waiting strong {
  color: var(--menu-title);
  font-size: clamp(1.45rem, 4vw, 2rem);
  font-weight: 950;
  letter-spacing: 0;
  line-height: 0.95;
}

.menu-order-waiting small {
  margin-top: 0.65rem;
  color: var(--menu-muted);
  font-size: clamp(0.92rem, 2vw, 1.05rem);
  font-weight: 800;
  line-height: 1.45;
}

.menu-order-waiting__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0;
  margin: 1rem 0 0;
  list-style: none;
}

.menu-order-waiting__step {
  padding: 0.35rem 0.55rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.menu-order-waiting__step--done {
  border-color: color-mix(in srgb, var(--menu-accent) 36%, transparent);
  background: color-mix(in srgb, var(--menu-accent) 12%, transparent);
  color: var(--menu-title);
}

.menu-order-waiting__reference {
  font-size: 0.78rem;
  opacity: 0.78;
}

.menu-order-waiting__spinner {
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border: 3px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-top-color: var(--menu-accent);
  border-radius: 999px;
  animation: menu-order-spin 0.8s linear infinite;
}

.menu-order-waiting__accepted {
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  color: var(--menu-accent);
}

@keyframes menu-order-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .menu-order-waiting {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .menu-order-waiting__close {
    text-align: center;
  }

  .menu-order-waiting__actions {
    grid-column: 1 / -1;
    justify-self: stretch;
    flex-direction: column;
  }

  .menu-order-waiting__steps {
    display: grid;
  }
}
</style>
