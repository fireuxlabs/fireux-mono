<template>
  <MenuDetailFunnelBasket
    v-if="step === 1"
    :order="order"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <p v-else class="menu-order-placeholder">
    This order funnel is not wired yet. Collection is the first finishable path.
  </p>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const allergenAccepted = ref(false)

watchEffect(() => {
  emit('update:ready', props.step < 3 && (props.step !== 2 || allergenAccepted.value))
})

watch(() => props.order.quantity, (quantity: number) => {
  if (quantity) return

  allergenAccepted.value = false
})

watch(() => props.order.orderType, () => {
  allergenAccepted.value = false
})
</script>
