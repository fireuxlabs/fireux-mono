<template>
  <MenuDetailFunnelBasketStep
    v-if="step === 1"
    :funnel="funnel"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <MenuDetailFunnelDineIn
    v-else-if="step === 3 && funnel.order.orderType === 'dine_in'"
    :funnel="funnel"
    @update:ready="$emit('update:ready', $event)"
  />

  <MenuDetailFunnelRoomService
    v-else-if="step === 3 && funnel.order.orderType === 'room_service'"
    :funnel="funnel"
    @update:ready="$emit('update:ready', $event)"
  />

  <MenuDetailFunnelPayment
    v-else-if="step === 4"
    :funnel="funnel"
  />

  <MenuDetailFunnelConfirmation
    v-else-if="step === 5"
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
  if (props.step === 2) {
    emit('update:ready', allergenAccepted.value)
    return
  }
  if (props.step !== 3) emit('update:ready', true)
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
