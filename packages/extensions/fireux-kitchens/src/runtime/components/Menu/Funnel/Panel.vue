<template>
  <form
    class="menu-order-panel"
    aria-live="polite"
    @submit.prevent="$emit('submit', customerPayload)"
  >
    <div class="menu-order-panel__header">
      <div>
        <p class="menu-order-panel__eyebrow">
          {{ eyebrow }}
        </p>
        <h2>{{ title }}</h2>
      </div>

      <button
        type="button"
        class="menu-order-panel__close"
        aria-label="Back to menu"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>

    <p v-if="message" class="menu-order-panel__message">
      {{ message }}
    </p>

    <component
      :is="funnelComponent"
      v-model="customer"
      :policy="policy"
    />

    <button
      type="submit"
      class="menu-order-panel__submit"
      :disabled="pending"
    >
      {{ pending ? 'Sending...' : submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/menu/menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderType,
} from '../../../models/order.model'
import {
  cleanKitchenOrderCustomer,
  menuOrderFunnelTitle,
  menuOrderSubmitLabel,
  menuOrderTypeLabel,
} from '../../../utils/menu-ordering-ui'
import MenuFunnelCollection from './Collection.vue'
import MenuFunnelDefault from './Default.vue'
import MenuFunnelDelivery from './Delivery.vue'
import MenuFunnelPreOrder from './PreOrder.vue'

const props = withDefaults(
  defineProps<{
    orderType: KitchenOrderType
    policy?: MenuOrderTypeConfig
    pending?: boolean
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'close'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
}>()

const customer = ref<KitchenOrderCustomer>({})
const eyebrow = computed(() => menuOrderTypeLabel(props.orderType))
const title = computed(() => menuOrderFunnelTitle(props.orderType))
const submitLabel = computed(() => menuOrderSubmitLabel(props.orderType))
const message = computed(() => props.policy?.message || '')
const customerPayload = computed<KitchenOrderCustomer>(() =>
  cleanKitchenOrderCustomer(customer.value)
)
const funnelComponents: Partial<Record<KitchenOrderType, Component>> = {
  delivery: MenuFunnelDelivery,
  collection: MenuFunnelCollection,
  pre_order: MenuFunnelPreOrder,
}
const funnelComponent = computed(() =>
  funnelComponents[props.orderType] || MenuFunnelDefault
)
</script>

<style scoped>
.menu-order-panel {
  display: grid;
  gap: 1rem;
  width: min(44rem, calc(100% - 1rem));
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

.menu-order-panel__header {
  display: flex;
  gap: 1rem;
  align-items: start;
  justify-content: space-between;
}

.menu-order-panel__eyebrow,
.menu-order-panel__message,
.menu-order-panel h2 {
  margin: 0;
}

.menu-order-panel__eyebrow {
  color: var(--menu-muted);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.menu-order-panel h2 {
  color: var(--menu-title);
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 950;
  letter-spacing: -0.05em;
}

.menu-order-panel__close {
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
}

.menu-order-panel__message {
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}

.menu-order-panel__submit {
  justify-self: end;
  min-height: 2.6rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 900;
}

.menu-order-panel__submit:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

</style>
