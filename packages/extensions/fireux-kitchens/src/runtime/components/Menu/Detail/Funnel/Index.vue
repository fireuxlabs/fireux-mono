<template>
  <MenuDetailFunnelCollection
    v-if="order.orderType === 'collection'"
    :order="order"
    @close="$emit('close')"
  />

  <div
    v-else
    class="menu-order-funnel"
    :class="{ 'menu-order-funnel--panel': order.panelOpen }"
  >
    <section class="menu-order-card">
      <button
        type="button"
        class="menu-order-fold justify-self-end"
        aria-label="Fold order funnel away"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
      </button>

      <MenuDetailFunnelBasket :order="order" />

      <ClientOnly>
        <MenuDetailFunnelAllergen v-model="allergenAccepted" />
      </ClientOnly>

      <p v-if="order.message" class="menu-order-placeholder">
        {{ order.message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'close'): void
}>()

const allergenAccepted = ref(false)
</script>
