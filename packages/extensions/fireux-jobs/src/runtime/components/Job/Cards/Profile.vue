<template>
  <UCard v-if="card || job">
    <div class="space-y-5">
      <div v-if="card" class="space-y-4">
        <UUser
          v-if="companyCard"
          :name="companyCard.title"
          :description="companyCard.subtitle"
          :avatar="{ src: companyCard.imageUrl, alt: companyCard.title }"
          size="sm"
        />

        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-2">
            <div class="text-xl font-semibold leading-tight">
              {{ card.title }}
            </div>
            <div v-if="card.subtitle" class="text-sm text-dimmed">
              {{ card.subtitle }}
            </div>
          </div>

          <UBadge
            v-if="card.status"
            size="sm"
            variant="soft"
            :color="card.status === 'open' ? 'emerald' : 'neutral'"
          >
            {{ card.status === 'open' ? 'Open' : card.status }}
          </UBadge>
        </div>

        <p v-if="card.description" class="text-sm leading-7 text-toned">
          {{ card.description }}
        </p>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="text-xs font-semibold uppercase tracking-[0.14em] text-dimmed"
            >
              Compensation
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ payLabel }}
            </div>
          </div>

          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="text-xs font-semibold uppercase tracking-[0.14em] text-dimmed"
            >
              Openings
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ openingsLabel }}
            </div>
          </div>

          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="text-xs font-semibold uppercase tracking-[0.14em] text-dimmed"
            >
              Role type
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ jobTypeLabel }}
            </div>
          </div>
        </div>

        <div v-if="card.badges?.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            size="sm"
            variant="soft"
            color="neutral"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>

      <details
        v-if="isDev && job"
        class="rounded-2xl border border-default bg-muted/30 p-4"
      >
        <summary class="cursor-pointer text-sm font-medium">
          Debug job payload
        </summary>

        <div class="mt-4 space-y-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="field in jobFields"
              :key="field.key"
              class="rounded-xl border border-default bg-default p-3"
            >
              <div
                class="text-[0.7rem] uppercase tracking-[0.14em] text-dimmed"
              >
                {{ field.label }}
              </div>
              <div class="mt-1 break-words text-sm font-medium">
                {{ field.value }}
              </div>
            </div>
          </div>

          <pre
            class="overflow-x-auto rounded-xl border border-default bg-default p-3 text-xs"
            >{{ jobJson }}</pre
          >
        </div>
      </details>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CompanyCard } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface'
import { computed } from 'vue'
import type {
  JobCard,
  JobView,
} from '../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{
  card?: JobCard.Card
  job?: JobView | null
  companyCard?: CompanyCard.Card | null
}>()
const isDev = import.meta.dev

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  return JSON.stringify(value, null, 2)
}

const jobFields = computed(() => {
  const job = props.job
  if (!job) return [] as Array<{ key: string; label: string; value: string }>
  return [
    { key: 'id', label: 'id', value: formatValue(job.id) },
    {
      key: 'company_id',
      label: 'company_id',
      value: formatValue(job.company_id),
    },
    {
      key: 'workplace_type',
      label: 'workplace_type',
      value: formatValue(job.workplace_type),
    },
    {
      key: 'workplace_id',
      label: 'workplace_id',
      value: formatValue(job.workplace_id),
    },
    {
      key: 'workplace_label',
      label: 'workplace_label',
      value: formatValue(job.workplace_label),
    },
    { key: 'job_type', label: 'job_type', value: formatValue(job.job_type) },
    {
      key: 'openings_count',
      label: 'openings_count',
      value: formatValue(job.openings_count),
    },
    {
      key: 'pay_currency',
      label: 'pay_currency',
      value: formatValue(job.pay_currency),
    },
    { key: 'pay_rate', label: 'pay_rate', value: formatValue(job.pay_rate) },
    { key: 'pay_unit', label: 'pay_unit', value: formatValue(job.pay_unit) },
    { key: 'start_at', label: 'start_at', value: formatValue(job.start_at) },
    { key: 'end_at', label: 'end_at', value: formatValue(job.end_at) },
    { key: 'title', label: 'title', value: formatValue(job.title) },
    {
      key: 'description',
      label: 'description',
      value: formatValue(job.description),
    },
    { key: 'status', label: 'status', value: formatValue(job.status) },
    {
      key: 'source_app_id',
      label: 'source_app_id',
      value: formatValue(job.source_app_id),
    },
    {
      key: 'workplace',
      label: 'workplace',
      value: formatValue((job as any).workplace),
    },
  ]
})

const jobJson = computed(() =>
  props.job ? JSON.stringify(props.job, null, 2) : ''
)
const payLabel = computed(() => {
  const job = props.job
  if (!job?.pay_rate) return 'Discuss'
  return `${job.pay_currency || 'CHF'} ${job.pay_rate}/${job.pay_unit || 'hour'}`
})
const openingsLabel = computed(() => {
  const count = Number(props.job?.openings_count || 0)
  return count > 0 ? `${count} opening${count === 1 ? '' : 's'}` : 'Flexible'
})
const jobTypeLabel = computed(() => {
  const value = String(props.job?.job_type || '').trim()
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Role'
})
</script>
