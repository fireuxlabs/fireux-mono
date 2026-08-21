<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">Kitchen</h2>

    <section class="menu-order-dispatch__section">
      <span class="menu-order-kitchen-ping" aria-hidden="true">
        <UIcon name="i-lucide-chef-hat" class="menu-order-dispatch__icon" />
      </span>

      <div class="menu-order-dispatch__copy">
        <strong>Contacting kitchen</strong>
        <span v-if="manifestLabel" class="menu-order-manifest">
          {{ manifestLabel }}
        </span>

        <button type="button" class="menu-order-copy" @click="copyRequest">
          <UIcon
            :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            aria-hidden="true"
          />
          {{ copied ? 'Copied' : 'Copy request' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()
const copied = ref(false)

const manifestLabel = computed(() => {
  if (props.funnel.sending.pending) return 'Sending basket...'
  if (props.funnel.sending.sent_order?.order_number) {
    return `Visible in kitchen · ${props.funnel.sending.sent_order.order_number}`
  }
  if (props.funnel.sending.sent_order?.id) return 'Visible in kitchen'

  return ''
})

const requestBasket = computed(() =>
  props.funnel.incoming.basket.map((item) => ({
    quantity: item.quantity,
    name: item.name,
  }))
)
const requestTotal = computed(() =>
  props.funnel.incoming.basket.reduce(
    (total, item) => total + item.quantity * Number(item.unit_price_chf || 0),
    0
  )
)
const requestPayload = computed(() => ({
  surface: 'menu_order_funnel',
  action: 'collection_queue_request',
  copied_at: new Date().toISOString(),
  request: {
    type: props.funnel.incoming.order_type,
    collection: props.funnel.incoming.collection,
    basket: requestBasket.value,
    allergen_checked: Boolean(props.funnel.incoming.allergen_checked),
    total_chf: requestTotal.value,
  },
  sent: props.funnel.sending.sent_order
    ? {
        id: props.funnel.sending.sent_order.id,
        number: props.funnel.sending.sent_order.order_number,
        status: props.funnel.sending.sent_order.status || '',
      }
    : null,
}))

async function copyRequest() {
  if (!import.meta.client || !navigator.clipboard) return

  await navigator.clipboard.writeText(
    JSON.stringify(requestPayload.value, null, 2)
  )
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<style scoped>
.menu-order-manifest {
  display: inline-flex;
  width: fit-content;
  padding: 0.28rem 0.58rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-text);
  font-size: 0.78rem;
  font-weight: var(--font-weight-black);
}

.menu-order-copy {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  width: fit-content;
  padding: 0.38rem 0.64rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 84%, var(--menu-text));
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: var(--font-weight-black);
}

.menu-order-kitchen-ping {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  animation: menu-kitchen-pulse 1.8s ease-in-out infinite;
}

.menu-order-kitchen-ping::before {
  position: absolute;
  inset: -0.45rem;
  border: 1px solid currentcolor;
  border-radius: 9999px;
  color: var(--menu-primary);
  content: '';
  opacity: 0;
  animation: menu-kitchen-ping 1.8s ease-out infinite;
}

.menu-order-kitchen-ping::after {
  position: absolute;
  inset: -0.85rem;
  border: 1px solid currentcolor;
  border-radius: 9999px;
  color: var(--menu-primary);
  content: '';
  opacity: 0;
  animation: menu-kitchen-ping 1.8s ease-out 0.45s infinite;
}

@keyframes menu-kitchen-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  46% {
    transform: scale(1.08);
  }
}

@keyframes menu-kitchen-ping {
  0% {
    opacity: 0.35;
    transform: scale(0.72);
  }

  78%,
  100% {
    opacity: 0;
    transform: scale(1.28);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-order-kitchen-ping,
  .menu-order-kitchen-ping::after,
  .menu-order-kitchen-ping::before {
    animation: none;
  }
}
</style>
