<template>
  <section v-if="methods.length" class="grid gap-2 text-left">
    <p class="m-0 text-sm font-black text-highlighted">Payment method</p>

    <URadioGroup
      v-model="selected"
      :items="options"
      value-key="value"
      label-key="label"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { KitchenOrderPaymentMethod } from '../../../../kitchen/utils/order.ts'
import type { MenuOrderingFunnelController } from '../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const labels: Record<KitchenOrderPaymentMethod, string> = {
  cash: 'Cash',
  card_at_pickup: 'Card at pickup',
  card_to_driver: 'Card to driver',
  room_charge: 'Charge to room',
  online_card: 'Online card',
  deposit: 'Online deposit',
  pay_later: 'Pay later',
}
const methods = computed<KitchenOrderPaymentMethod[]>(() => {
  const configured =
    props.funnel.order.policy?.fulfilment?.payment_methods || []
  const withDeposit = props.funnel.order.policy?.fulfilment?.deposit
    ? ['deposit' as const]
    : configured

  return withDeposit.filter(
    (method, index, source) => source.indexOf(method) === index
  )
})
const options = computed(() =>
  methods.value.map((value) => ({
    value,
    label: labels[value],
  }))
)
const selected = computed({
  get: () => props.funnel.incoming.payment_method,
  set: (payment_method: KitchenOrderPaymentMethod | undefined) => {
    props.funnel.collect({ payment_method })
  },
})

watchEffect(() => {
  if (!methods.value.length) return
  if (selected.value && methods.value.includes(selected.value)) return

  selected.value = methods.value[0]
})
</script>
