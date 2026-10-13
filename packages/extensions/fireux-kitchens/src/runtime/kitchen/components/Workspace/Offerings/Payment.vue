<template>
  <UCard>
    <template #header><h2>Payment</h2></template>
    <MoleculesStateCard
      v-if="pending || outcome === 'pending'"
      entity="Payment methods"
      loading
    />
    <MoleculesCopyError v-else-if="error" :message="String(error)" />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      state="error"
    />
    <UAlert
      v-else-if="!selectedKitchen"
      title="Kitchen access is unavailable for this account"
      color="neutral"
    />
    <template v-else>
      <p>{{ methodsLabel || 'No payment methods configured' }}</p>
      <p class="text-muted text-sm">{{ depositLabel }}</p>
      <UButton
        :to="openWorkspace ? undefined : '/workspace/kitchen/fulfilment'"
        @click="openWorkspace?.('/workspace/kitchen/fulfilment')"
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
const paymentLabels: Record<string, string> = { cash: 'Cash', card_at_pickup: 'Card at pickup', card_to_driver: 'Card to driver', room_charge: 'Room charge', online_card: 'Online card' }
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
const props = defineProps<{
  config: KitchenOrderTypeConfig
  kitchenId: string
  openWorkspace?: (path: string) => unknown
}>()
const { fulfilment, pending, error, selectedKitchen, outcome } =
  useKitchenFulfilment(() => props.kitchenId)
const methodsLabel = computed(() =>
  kitchenPaymentMethodsForOrderType(fulfilment.value, props.config.type)
    .map((method) => paymentLabels[method] || method)
    .join(' · ')
)
const depositLabel = computed(() => {
  const deposit = props.config.fulfilment?.deposit
  if (!deposit) return 'No deposit'
  if (deposit.type === 'percent') return `${deposit.amount}% deposit`
  const currency = selectedKitchen.value?.currency_code
  const amount = currency
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
        deposit.amount
      )
    : String(deposit.amount)
  return `${amount}${deposit.type === 'fixed_per_person' ? ' per guest' : ''} deposit`
})
</script>
