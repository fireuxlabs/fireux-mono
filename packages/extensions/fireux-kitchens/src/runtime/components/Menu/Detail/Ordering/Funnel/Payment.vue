<template>
  <div v-if="paymentLabels.length || depositLabel" class="menu-order-payment">
    <p>Payment</p>
    <fieldset
      v-if="selectableMethods.length > 1"
      class="menu-order-payment__options"
    >
      <legend class="sr-only">Choose payment method</legend>
      <label
        v-for="method in selectableMethods"
        :key="method"
        class="menu-order-payment__option"
        :class="{ 'menu-order-payment__option--selected': method === selectedMethod }"
      >
        <input
          v-model="selectedMethod"
          type="radio"
          :value="method"
        >
        <span>{{ paymentLabel(method) }}</span>
      </label>
    </fieldset>
    <span v-else>{{ paymentSummary }}</span>
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
    modelValue?: MenuPaymentMethod
    methods?: MenuPaymentMethod[]
    deposit?: MenuOrderDepositPolicy
    orderType?: string
    partySize?: number
    totalChf?: number
  }>(),
  {
    modelValue: undefined,
    methods: () => [],
    deposit: undefined,
    orderType: '',
    partySize: 0,
    totalChf: 0,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: MenuPaymentMethod): void
}>()

const paymentLabel = (method: MenuPaymentMethod) => {
  const paymentLabels: Record<MenuPaymentMethod, string> = {
    cash: props.orderType === 'delivery' ? 'Cash on delivery' : 'Cash',
    card_at_pickup: 'Card at pickup',
    card_to_driver: props.orderType === 'delivery' ? 'Card on delivery' : 'Card to driver',
    online_card: 'Online card',
    deposit: 'Deposit',
  }

  return paymentLabels[method] || method
}
const selectableMethods = computed(() =>
  Array.from(new Set(props.methods)).filter((method) => method !== 'deposit')
)
const selectedMethod = computed({
  get: () => props.modelValue || selectableMethods.value[0],
  set: (value: MenuPaymentMethod) => emit('update:modelValue', value),
})
const paymentLabels = computed(() =>
  selectableMethods.value.map(paymentLabel)
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

.menu-order-payment__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: end;
  margin: 0;
  padding: 0;
  border: 0;
}

.menu-order-payment__option {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  min-height: 2rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 850;
}

.menu-order-payment__option--selected {
  border-color: color-mix(in srgb, var(--menu-primary) 70%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 16%, var(--menu-bg));
}

.menu-order-payment__option input {
  accent-color: var(--menu-primary);
}
</style>
