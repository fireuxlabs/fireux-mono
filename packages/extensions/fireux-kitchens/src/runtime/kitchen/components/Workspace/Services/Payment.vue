<template>
  <UCard>
    <template #header><h2>Payment</h2></template>
    <MoleculesStateCard v-if="pending" entity="Payment methods" loading />
    <MoleculesCopyError v-else-if="error" :message="String(error)" />
    <template v-else>
      <p>{{ methodsLabel || 'No payment methods configured' }}</p>
      <p class="text-muted text-sm">{{ depositLabel }}</p>
      <UButton
        to="/workspace/kitchen/fulfilment"
        label="Edit payment methods"
        color="neutral"
        variant="soft"
        class="mt-4"
      />
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenFulfilment } from '../../../composables/workspace/fulfilment/useKitchenFulfilment'
import { kitchenPaymentMethodsForOrderType } from '../../../utils/kitchen-readers'
import { kitchenOrderPaymentMethodLabel } from '../../../../menu/utils/menu-order-payment'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
const props = defineProps<{ config: KitchenOrderTypeConfig }>()
const { fulfilment, pending, error, selectedKitchen } = useKitchenFulfilment()
const methodsLabel = computed(() =>
  kitchenPaymentMethodsForOrderType(fulfilment.value, props.config.type)
    .map((method) => kitchenOrderPaymentMethodLabel(props.config.type, method))
    .join(' · ')
)
const depositLabel = computed(() => {
  const deposit = props.config.fulfilment?.deposit
  if (!deposit) return 'No deposit'
  if (deposit.type === 'percent') return `${deposit.amount}% deposit`
  const currency = selectedKitchen.value?.currency
  const amount = currency
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
        deposit.amount
      )
    : String(deposit.amount)
  return `${amount}${deposit.type === 'fixed_per_person' ? ' per guest' : ''} deposit`
})
</script>
