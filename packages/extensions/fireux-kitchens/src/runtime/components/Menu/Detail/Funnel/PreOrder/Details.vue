<template>
  <div class="menu-order-dispatch">
    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-calendar-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Pre-order details</strong>
        <span>{{ preOrderStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const preOrderStatus = computed(() =>
  props.order.policy?.message ||
  'The kitchen will confirm your pre-order time before payment.'
)

watchEffect(() => {
  emit('update:ready', true)
})
</script>
