<template>
  <UCard>
    <template #header>
      <div>
        <h2>Restaurant labour cost calculator</h2>
        <p>Compare total labour cost with sales. Nothing is saved.</p>
      </div>
    </template>

    <form class="fx-card-body-stack" @submit.prevent="calculate">
      <div class="fx-card-body-stack">
        <UFormField label="Sales" required>
          <UInput v-model="sales" type="number" min="0.01" step="0.01">
            <template #leading>CHF</template>
          </UInput>
        </UFormField>
        <UFormField label="Wages" required>
          <UInput v-model="wages" type="number" min="0" step="0.01">
            <template #leading>CHF</template>
          </UInput>
        </UFormField>
        <UFormField label="Employer costs">
          <UInput v-model="employerCosts" type="number" min="0" step="0.01">
            <template #leading>CHF</template>
          </UInput>
        </UFormField>
        <UFormField label="Other labour costs">
          <UInput v-model="otherLabourCosts" type="number" min="0" step="0.01">
            <template #leading>CHF</template>
          </UInput>
        </UFormField>
      </div>

      <div class="fx-card__actions">
        <UButton
          type="submit"
          label="Calculate labour cost"
          icon="i-lucide-calculator"
        />
        <p v-if="error">{{ error }}</p>
      </div>
    </form>

    <template v-if="result" #footer>
      <div>
        <div>
          <p>Total labour cost</p>
          <p>
            {{ formatMoney(result.totalLabourCost) }}
          </p>
        </div>
        <div>
          <p>Labour percentage</p>
          <p>
            {{ formatPercentage(result.labourPercentage) }}
          </p>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  financialMoneyFromDecimal,
  formatFinancialMinorAmount,
} from 'fireux-finance/runtime/utils/money'
import {
  calculateRestaurantLabourCost,
  type RestaurantLabourCostResult,
} from '../../utils/finance/restaurant-labour-cost'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'

const sales = ref('20000')
const wages = ref('5000')
const employerCosts = ref('0')
const otherLabourCosts = ref('0')
const result = ref<RestaurantLabourCostResult | null>(null)
const error = ref('')

const toMoney = (value: string, label: string) =>
  financialMoneyFromDecimal({
    amount: Number(value),
    currencyCode: 'CHF',
    minorUnitDigits: 2,
    allowNegative: false,
    label,
  })

function calculate() {
  error.value = ''
  try {
    result.value = calculateRestaurantLabourCost({
      sales: toMoney(sales.value, 'Sales'),
      wages: toMoney(wages.value, 'Wages'),
      employerCosts: toMoney(employerCosts.value || '0', 'Employer costs'),
      otherLabourCosts: toMoney(
        otherLabourCosts.value || '0',
        'Other labour costs'
      ),
    })
  } catch (failure) {
    result.value = null
    error.value =
      failure instanceof Error
        ? failure.message
        : 'Could not calculate labour cost.'
  }
}

const formatMoney = (money: FinancialMoney) =>
  formatFinancialMinorAmount(money.amount_minor, money.currency_code, {
    locales: 'en-CH',
  })
const formatPercentage = (value: number) =>
  new Intl.NumberFormat('en-CH', { maximumFractionDigits: 2 }).format(value) +
  '%'

calculate()
</script>
