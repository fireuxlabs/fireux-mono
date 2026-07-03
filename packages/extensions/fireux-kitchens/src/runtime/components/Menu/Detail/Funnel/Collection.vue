<template>
  <MenuDetailFunnelBasket
    v-if="step === 1"
    :order="funnel.order"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelCollectionRendezvous
    v-else-if="step === 3"
    :order="funnel.order"
    @update:ready="rendezvousReady = $event"
  />

  <MenuDetailFunnelCollectionKitchen
    v-else-if="step === 4"
    :funnel="funnel"
  />

  <MenuDetailFunnelPayment v-else-if="step === 5" />

  <MenuDetailFunnelConfirmation v-else-if="step === 6" />
</template>

<script setup lang="ts">
import {
  watch,
  watchEffect,
} from 'vue'
import { useCollection } from '../../../../composables/fireux/kitchen/order/funnel/Collection/useCollection'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const {
  allergenAccepted,
  ready,
  rendezvousReady,
} = useCollection(() => props.funnel.order, () => props.step)

watchEffect(() => {
  emit('update:ready', ready.value)
})

watch(allergenAccepted, (accepted: boolean) => {
  props.funnel.collect({
    allergen_checked: accepted,
  })
})
</script>
