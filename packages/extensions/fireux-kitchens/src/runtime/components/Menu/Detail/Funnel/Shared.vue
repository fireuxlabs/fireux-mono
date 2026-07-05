<template>
  <MenuDetailFunnelBasket
    v-if="step === 1"
    :order="funnel.order"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelPayment
    v-else-if="step === 3"
    :funnel="funnel"
  />

  <MenuDetailFunnelConfirmation
    v-else-if="step === 4"
    :funnel="funnel"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

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

watch([() => props.step, allergenAccepted], () => {
  emit('update:ready', props.step !== 2 || allergenAccepted.value)
}, {
  immediate: true,
})

watch(() => props.funnel.order.quantity, (quantity: number) => {
  if (quantity) return

  props.funnel.collect({
    allergen_checked: false,
  })
})

watch(() => props.funnel.order.orderType, () => {
  props.funnel.collect({
    allergen_checked: false,
  })
})
</script>
