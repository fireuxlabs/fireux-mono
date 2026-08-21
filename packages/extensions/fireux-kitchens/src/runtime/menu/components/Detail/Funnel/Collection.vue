<template>
  <MenuDetailFunnelBasketStep v-if="step === 1" :funnel="funnel" />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelCollectionRequest
    v-else-if="step === 3"
    :state="collectionFunnel"
  />

  <MenuDetailFunnelCollectionKitchen v-else-if="step === 4" :funnel="funnel" />

  <MenuDetailFunnelPayment v-else-if="step === 5" :funnel="funnel" />

  <MenuDetailFunnelConfirmation v-else-if="step === 6" :funnel="funnel" />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useCollectionFunnel } from '../../../../kitchen/composables/order/funnel/Collection/useCollectionFunnel'
import type { MenuOrderingFunnelController } from '../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const collectionFunnel = useCollectionFunnel(
  () => props.funnel.order,
  () => props.step,
  () => props.funnel.incoming
)
const allergenAccepted = computed({
  get: () => Boolean(props.funnel.incoming.allergen_checked),
  set: (accepted: boolean) => {
    props.funnel.collect({
      allergen_checked: accepted,
    })
  },
})

watchEffect(() => {
  emit('update:ready', collectionFunnel.ready.value)
})

watchEffect(() => {
  props.funnel.collect({
    collection: collectionFunnel.collection.value,
  })
})
</script>
