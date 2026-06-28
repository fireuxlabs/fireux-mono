<template>
  <div v-if="paymentLabels.length" class="menu-order-payment">
    <p>Payment</p>
    <span>{{ paymentSummary }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuOrderDepositPolicy,
  MenuPaymentMethod,
} from '../../../../../models/menu/menu.model'

const props = withDefaults(
  defineProps<{
    methods?: MenuPaymentMethod[]
    deposit?: MenuOrderDepositPolicy
    partySize?: number
    totalChf?: number
  }>(),
  {
    methods: () => [],
    deposit: undefined,
    partySize: 0,
    totalChf: 0,
  }
)

const paymentLabel = (method: MenuPaymentMethod) => {
  const paymentLabels: Record<MenuPaymentMethod, string> = {
    cash: 'Cash',
    card_at_pickup: 'Card at pickup',
    card_to_driver: 'Card to driver',
    online_card: 'Online card',
    deposit: 'Deposit',
  }

  return paymentLabels[method] || method
}
const paymentLabels = computed(() =>
  props.methods.map(paymentLabel)
)
const money = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: props.deposit?.currency_code || 'CHF',
  }).format(value)
const depositAmount = computed(() => {
  const deposit = props.deposit
  const amount = Number(deposit?.amount || 0)
  if (!deposit || !Number.isFinite(amount) || amount <= 0) return 0
  if (deposit.type === 'fixed') return amount
  if (deposit.type === 'fixed_per_person') {
    return amount * Math.max(1, Math.floor(Number(props.partySize || 0) || 1))
  }
  if (deposit.type === 'percent') {
    return Number(props.totalChf || 0) * (amount / 100)
  }

  return 0
})
const depositLabel = computed(() => {
  if (!props.deposit || !depositAmount.value) return ''
  const label = props.deposit.label || 'Deposit'
  if (props.deposit.type === 'fixed_per_person') {
    return `${label}: ${money(Number(props.deposit.amount || 0))} per person`
  }

  return `${label}: ${money(depositAmount.value)}`
})
const paymentSummary = computed(() =>
  [
    depositLabel.value,
    ...paymentLabels.value,
  ].filter(Boolean).join(' · ')
)
</script>

<style scoped>
.menu-order-payment {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  color: var(--menu-muted);
  font-size: 0.88rem;
}

.menu-order-payment p {
  margin: 0;
  color: var(--menu-title);
  font-weight: 850;
}
</style>
