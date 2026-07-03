<template>
  <MenuDetailFunnelBasket
    v-if="step === 1"
    :order="order"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelCollectionRendezvous
    v-else-if="step === 3"
    :order="order"
    @update:ready="rendezvousReady = $event"
  />

  <MenuDetailFunnelCollectionKitchen
    v-else-if="step === 4"
  />

  <MenuDetailFunnelPayment v-else-if="step === 5" />

  <MenuDetailFunnelConfirmation v-else-if="step === 6" />
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useCollection } from '../../../../composables/fireux/kitchen/order/funnel/Collection/useCollection'
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const {
  allergenAccepted,
  ready,
  rendezvousReady,
} = useCollection(() => props.order, () => props.step)

watchEffect(() => {
  emit('update:ready', ready.value)
})
</script>
