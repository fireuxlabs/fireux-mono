<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-highlighted">
          Restaurant labour cost calculator
        </h2>
        <p class="mt-1 text-sm text-muted">
          Compare total labour cost with sales. Nothing is saved.
        </p>
      </div>
    </template>

    <form class="grid gap-4" @submit.prevent="calculate">
      <div class="grid gap-4 sm:grid-cols-2">
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

      <div class="flex flex-wrap items-center gap-3">
        <UButton type="submit" label="Calculate labour cost" icon="i-lucide-calculator" />
        <p v-if="error" class="text-sm text-error">{{ error }}</p>
      </div>
    </form>

    <template v-if="result" #footer>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Total labour cost
          </p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-highlighted">
            {{ formatMoney(result.totalLabourCost) }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Labour percentage
          </p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-primary">
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
} from '../../../tools/team/restaurant-labour-cost'
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
    error.value = failure instanceof Error ? failure.message : 'Could not calculate labour cost.'
  }
}

const formatMoney = (money: FinancialMoney) =>
  formatFinancialMinorAmount(money.amount_minor, money.currency_code, {
    locales: 'en-CH',
  })
const formatPercentage = (value: number) =>
  new Intl.NumberFormat('en-CH', { maximumFractionDigits: 2 }).format(value) + '%'

calculate()
</script>
