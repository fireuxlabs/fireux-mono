<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: expose category and workplace fields in Job debug output. -->
<!-- Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: keep source App scope out of shared presentation. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: present canonical employer, Place, contract, schedule, and compensation truth. -->
<template>
  <UCard v-if="card || job">
    <div class="space-y-5">
      <div v-if="card" class="space-y-4">
        <UUser
          v-if="companyCard || card.companyName"
          :name="companyCard?.title || card.companyName"
          :description="companyCard?.subtitle || card.placeAddress || card.placeName"
          :avatar="{
            src: companyCard?.imageUrl || card.companyImageUrl || undefined,
            alt: companyCard?.title || card.companyName,
          }"
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
            :color="card.status === 'open' ? 'success' : 'neutral'"
          >
            {{ card.status === 'open' ? 'Open' : card.status }}
          </UBadge>
        </div>

        <p v-if="card.description" class="text-sm leading-7 text-toned">
          {{ card.description }}
        </p>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="fx-type-label"
            >
              Compensation
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ compensationLabel }}
            </div>
          </div>

          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="fx-type-label"
            >
              Openings
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ openingsLabel }}
            </div>
          </div>

          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div
              class="fx-type-label"
            >
              Contract
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ contractTypeLabel }}
            </div>
          </div>

          <div class="rounded-2xl border border-default bg-muted/40 p-4">
            <div class="fx-type-label">
              Management
            </div>
            <div class="mt-2 text-lg font-semibold">
              {{ managementModeLabel }}
            </div>
          </div>
        </div>

        <div
          v-if="scheduleLabel !== 'Schedule not specified'"
          class="rounded-2xl border border-default bg-muted/40 p-4"
        >
          <div class="fx-type-label">Schedule</div>
          <div class="mt-2 text-sm font-medium">{{ scheduleLabel }}</div>
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
                class="fx-type-label"
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
import type { CompanyCard } from 'fireux-companies/runtime/composables/fireux/company/useCompanyInterface'
import { computed } from 'vue'
import type {
  JobCard,
  JobView,
} from '../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import {
  formatJobCompensation,
  formatJobContractType,
  formatJobManagementMode,
  formatJobOpenings,
  formatJobSchedule,
} from '../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

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
      key: 'category_id',
      label: 'category_id',
      value: formatValue(job.category_id),
    },
    { key: 'place_id', label: 'place_id', value: formatValue(job.place_id) },
    { key: 'company', label: 'company', value: formatValue(job.company) },
    { key: 'place', label: 'place', value: formatValue(job.place) },
    {
      key: 'contract_type',
      label: 'contract_type',
      value: formatValue(job.contract_type),
    },
    {
      key: 'management_mode',
      label: 'management_mode',
      value: formatValue(job.management_mode),
    },
    {
      key: 'openings_count',
      label: 'openings_count',
      value: formatValue(job.openings_count),
    },
    {
      key: 'compensation',
      label: 'compensation',
      value: formatValue(job.compensation),
    },
    { key: 'start_at', label: 'start_at', value: formatValue(job.start_at) },
    { key: 'end_at', label: 'end_at', value: formatValue(job.end_at) },
    { key: 'title', label: 'title', value: formatValue(job.title) },
    {
      key: 'description',
      label: 'description',
      value: formatValue(job.description),
    },
    { key: 'status', label: 'status', value: formatValue(job.status) },
  ]
})

const jobJson = computed(() =>
  props.job ? JSON.stringify(props.job, null, 2) : ''
)
const compensationLabel = computed(() =>
  props.card?.compensationLabel ?? formatJobCompensation(props.job?.compensation)
)
const openingsLabel = computed(() =>
  props.card?.openingsLabel ?? formatJobOpenings(props.job?.openings_count)
)
const contractTypeLabel = computed(() =>
  props.card?.contractTypeLabel ?? (
    props.job ? formatJobContractType(props.job.contract_type) : 'Contract'
  )
)
const managementModeLabel = computed(() =>
  props.card?.managementModeLabel ?? (
    props.job ? formatJobManagementMode(props.job.management_mode) : 'Direct hire'
  )
)
const scheduleLabel = computed(() =>
  props.card?.scheduleLabel ?? formatJobSchedule(
    props.job?.start_at ?? null,
    props.job?.end_at ?? null
  )
)
</script>
