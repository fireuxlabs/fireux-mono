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
        <strong>{{ order.accepted ? 'Order accepted' : 'Waiting for order to be accepted' }}</strong>
        <small>{{ order.message || 'The kitchen will confirm your order shortly.' }}</small>
      </span>

      <NuxtLink
        v-if="order.accepted"
        class="menu-order-waiting__close"
        to="/customers"
      >
        Close
      </NuxtLink>
    </aside>

    <MenuOrderBasket
      v-else-if="!order.funnelOpen"
      :quantity="order.quantity"
      :items="order.items"
      :pending="order.pending"
      :action-label="order.actionLabel"
      @clear="$emit('clear')"
      @place="$emit('openFunnel')"
    />

    <MenuFunnelPanel
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
import type { KitchenOrderCustomer } from '../../../models/order.model'
import type { MenuStructuredOrderOverlayState } from './types'

defineProps<{
  order: MenuStructuredOrderOverlayState
}>()

defineEmits<{
  (event: 'clear'): void
  (event: 'closeFunnel'): void
  (event: 'openFunnel'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
}>()
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

.menu-order-waiting__close {
  align-self: start;
  padding: 0.55rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
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
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.menu-order-waiting small {
  margin-top: 0.65rem;
  color: var(--menu-muted);
  font-size: clamp(0.92rem, 2vw, 1.05rem);
  font-weight: 800;
  line-height: 1.45;
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
    grid-column: 1 / -1;
    justify-self: stretch;
    text-align: center;
  }
}
</style>
