<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Basics.vue -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: select configured categories for multi-category apps. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: author canonical contract, schedule, openings, and compensation fields. -->
<!-- Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: author a neutral category id for all-category Apps. -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-muted">
          {{ props.stepLabel }} · {{ props.title }}
        </p>
        <h2 class="text-lg font-semibold">{{ props.title }}</h2>
        <p v-if="props.subtitle" class="text-sm text-muted">
          {{ props.subtitle }}
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <UFormField
        v-if="jobsConfig.categoryScope === 'all'"
        label="Category"
        required
      >
        <UInput
          v-model="form.category_id"
          placeholder="e.g. cleaning"
          maxlength="120"
        />
      </UFormField>

      <UFormField v-else-if="categoryOptions.length > 1" label="Category" required>
        <USelect
          v-model="form.category_id"
          :options="categoryOptions"
          placeholder="Choose a category"
        />
      </UFormField>

      <UFormField label="Job title" required>
        <UInput
          v-model="form.title"
          autofocus
          placeholder="e.g. Evening site assistant"
          icon="i-lucide-briefcase"
        />
      </UFormField>

      <UFormField label="Job description" required>
        <UTextarea
          v-model="form.description"
          placeholder="Describe the work, responsibilities, and what you are looking for."
          :rows="7"
        />
      </UFormField>

      <div class="grid gap-4 md:grid-cols-3">
        <UFormField label="Contract" required>
          <USelect v-model="contractType" :options="contractTypeOptions" />
        </UFormField>

        <UFormField label="Management" required>
          <USelect
            v-model="form.management_mode"
            :options="managementModeOptions"
          />
        </UFormField>

        <UFormField label="Openings" required>
          <UInputNumber
            v-model="form.openings_count"
            :min="1"
            :max="500"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField
          label="Starts"
          :required="form.contract_type === 'fixed_term'"
        >
          <UInput v-model="startAtInput" type="datetime-local" />
        </UFormField>

        <UFormField
          v-if="form.contract_type !== 'permanent'"
          label="Ends"
          :required="form.contract_type === 'fixed_term'"
        >
          <UInput v-model="endAtInput" type="datetime-local" />
        </UFormField>
      </div>

      <UFormField label="Compensation">
        <USwitch
          v-model="discloseCompensation"
          label="Show compensation on the public job"
        />
      </UFormField>

      <div
        v-if="form.compensation"
        class="grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)]"
      >
        <UFormField label="Amount" required>
          <UInputNumber
            v-model="compensationAmount"
            :min="10 ** -compensationDigits"
            :format-options="{
              style: 'decimal',
              minimumFractionDigits: compensationDigits,
              maximumFractionDigits: compensationDigits,
            }"
          />
        </UFormField>

        <UFormField label="Currency" required>
          <UInput v-model="compensationCurrency" maxlength="3" />
        </UFormField>

        <UFormField label="Pay period" required>
          <USelect v-model="compensationUnit" :options="payUnitOptions" />
        </UFormField>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { Timestamp } from 'firebase/firestore'
import { financialCurrencyMinorUnitDigits } from 'fireux-finance/runtime/utils/money.ts'
import { computed } from 'vue'
import { useFireuxJobsConfig } from '../../../composables/config/useFireuxJobsConfig'
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'
import type {
  JobContractType,
  JobPayUnit,
} from '../../../models/job.model'

const jobsConfig = useFireuxJobsConfig()
const categoryOptions = computed(() =>
  jobsConfig.categories.map((value) => ({
    value,
    label: value
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase()),
  }))
)

const contractTypeOptions = [
  { label: 'Temporary', value: 'temporary' },
  { label: 'Fixed term', value: 'fixed_term' },
  { label: 'Permanent', value: 'permanent' },
]

const managementModeOptions = [
  { label: 'Direct hire', value: 'direct' },
  { label: 'Managed placement', value: 'managed' },
]

const payUnitOptions = [
  { label: 'Per hour', value: 'hour' },
  { label: 'Per shift', value: 'shift' },
  { label: 'Per day', value: 'day' },
]

const props = withDefaults(
  defineProps<{
    stepLabel?: string
    title?: string
    subtitle?: string
  }>(),
  {
    stepLabel: 'Step 2',
    title: 'Job basics',
    subtitle: '',
  }
)

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })

const contractType = computed<JobContractType>({
  get: () => form.value.contract_type,
  set: (value) => {
    form.value = {
      ...form.value,
      contract_type: value,
      ...(value === 'permanent' ? { end_at: null } : {}),
    }
  },
})

const discloseCompensation = computed({
  get: () => Boolean(form.value.compensation),
  set: (enabled: boolean) => {
    form.value = {
      ...form.value,
      compensation: enabled
        ? form.value.compensation ?? {
            amount_minor: 0,
            currency_code: 'CHF',
            unit: 'hour',
          }
        : null,
    }
  },
})

function currencyDigits(currencyCode: string): number {
  try {
    return financialCurrencyMinorUnitDigits(currencyCode || 'CHF')
  } catch {
    return 2
  }
}

const compensationDigits = computed(() =>
  currencyDigits(form.value.compensation?.currency_code ?? 'CHF')
)

const compensationAmount = computed<number>({
  get: () => {
    const compensation = form.value.compensation
    if (!compensation) return 0
    return compensation.amount_minor / 10 ** compensationDigits.value
  },
  set: (value) => {
    const compensation = form.value.compensation
    if (!compensation) return
    const amount = Number(value)
    form.value = {
      ...form.value,
      compensation: {
        ...compensation,
        amount_minor: Number.isFinite(amount)
          ? Math.round(amount * 10 ** compensationDigits.value)
          : 0,
      },
    }
  },
})

const compensationCurrency = computed({
  get: () => form.value.compensation?.currency_code ?? '',
  set: (value: string) => {
    const compensation = form.value.compensation
    if (!compensation) return
    const previousDigits = currencyDigits(compensation.currency_code)
    const amount = compensation.amount_minor / 10 ** previousDigits
    const currencyCode = String(value ?? '').toUpperCase().slice(0, 3)
    const nextDigits = currencyDigits(currencyCode)
    form.value = {
      ...form.value,
      compensation: {
        ...compensation,
        amount_minor: Math.round(amount * 10 ** nextDigits),
        currency_code: currencyCode,
      },
    }
  },
})

const compensationUnit = computed<JobPayUnit>({
  get: () => form.value.compensation?.unit ?? 'hour',
  set: (value) => {
    const compensation = form.value.compensation
    if (!compensation) return
    form.value = {
      ...form.value,
      compensation: { ...compensation, unit: value },
    }
  },
})

function timestampInput(value: JobCreateForm['start_at']): string {
  if (!value) return ''
  const source = value as unknown as {
    seconds?: number
    toDate?: () => Date
  }
  const date = typeof source.toDate === 'function'
    ? source.toDate()
    : new Date(Number(source.seconds ?? 0) * 1_000)
  if (!Number.isFinite(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function inputTimestamp(value: string): Timestamp | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? Timestamp.fromDate(date) : null
}

const startAtInput = computed({
  get: () => timestampInput(form.value.start_at),
  set: (value: string) => {
    form.value = { ...form.value, start_at: inputTimestamp(value) }
  },
})

const endAtInput = computed({
  get: () => timestampInput(form.value.end_at),
  set: (value: string) => {
    form.value = { ...form.value, end_at: inputTimestamp(value) }
  },
})
</script>
