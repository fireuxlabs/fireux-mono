<template>
  <MenuDetailFunnelBasketStep v-if="step === 1" :funnel="funnel" />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelDeliveryArea
    v-else-if="step === 3"
    :order="funnel.order"
    @update:delivery="setDelivery"
  />

  <MenuDetailFunnelDeliveryFulfilment
    v-else-if="step === 4"
    :order="funnel.order"
    :delivery="funnel.incoming.delivery"
    :driver-watching-count="funnel.processing.driver_watching_count"
    :order-id="funnel.processing.order_id"
  />

  <MenuDetailFunnelPayment v-else-if="step === 5" :funnel="funnel" />

  <MenuDetailFunnelConfirmation v-else-if="step === 6" :funnel="funnel" />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelController,
} from '../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const allergenAccepted = computed({
  get: () => Boolean(props.funnel.incoming.allergen_checked),
  set: (accepted: boolean) => {
    props.funnel.collect({
      allergen_checked: accepted,
    })
  },
})
const deliveryReady = computed(() =>
  Boolean(props.funnel.incoming.delivery?.ready)
)
function setDelivery(delivery: MenuOrderingDeliveryState) {
  props.funnel.collect({ delivery })
}

watchEffect(() => {
  if (props.step === 2) {
    emit('update:ready', allergenAccepted.value)
    return
  }
  if (props.step === 3) {
    emit('update:ready', deliveryReady.value)
    return
  }

  emit('update:ready', true)
})
</script>
