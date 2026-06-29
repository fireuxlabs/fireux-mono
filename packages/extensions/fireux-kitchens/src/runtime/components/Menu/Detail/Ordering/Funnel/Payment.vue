<template>
  <div v-if="paymentLabels.length || depositLabel" class="menu-order-payment">
    <template v-if="onlineCardOnly">
      <div class="menu-order-payment__pay-now">
        <p>Pay now</p>
        <strong>{{ paymentTotalLabel }}</strong>
        <span>Secure card payment before the kitchen accepts your order.</span>
      </div>

      <p
        v-if="deliveryFeeLabel"
        class="menu-order-payment__note"
      >
        {{ deliveryFeeLabel }}
      </p>
    </template>

    <template v-else>
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
    </template>
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
const onlineCardOnly = computed(() =>
  selectableMethods.value.length === 1 &&
  selectableMethods.value[0] === 'online_card'
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
const paymentTotalLabel = computed(() =>
  money(Math.max(0, Number(props.totalChf || 0)))
)
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
const deliveryFeeLabel = computed(() => {
  if (props.orderType !== 'delivery') return ''

  return 'Includes any delivery fee confirmed for your address.'
})
</script>
