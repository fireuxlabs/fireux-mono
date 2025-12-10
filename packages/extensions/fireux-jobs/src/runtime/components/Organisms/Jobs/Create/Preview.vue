<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">Preview</p>
            <h3 class="text-base font-semibold text-gray-900">
              {{ title }}
            </h3>
          </div>
          <UBadge :color="statusToneColor" variant="soft">
            {{ statusMeta.label }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-4 text-sm text-gray-600">
        <p v-if="form.description" class="whitespace-pre-line leading-relaxed">
          {{ form.description }}
        </p>

        <div class="grid gap-3 text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="h-4 w-4 text-gray-400" />
            <span>{{ dateSummary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock-3" class="h-4 w-4 text-gray-400" />
            <span>{{ timeSummary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-gray-400" />
            <span>{{ locationSummary }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-badge-dollar-sign" class="h-4 w-4 text-gray-400" />
            <span>{{ paySummary }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="form.notes">
      <template #header>
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <UIcon name="i-lucide-notebook-pen" class="h-4 w-4" />
          <span>Team notes</span>
        </div>
      </template>

      <p class="text-sm text-gray-600 whitespace-pre-line">
        {{ form.notes }}
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobDraft } from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'
import {
  defaultJobStatus,
  jobStatusMeta,
  type JobStatusMeta,
} from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'

const props = defineProps<{ form: JobDraft }>()

const toneMap: Record<JobStatusMeta['tone'], string> = {
  neutral: 'gray',
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
}

const title = computed(() => props.form.title.trim() || 'Untitled job')

const statusMeta = computed(() => jobStatusMeta[props.form.status] ?? jobStatusMeta[defaultJobStatus])
const statusToneColor = computed(() => toneMap[statusMeta.value.tone])

const dateSummary = computed(() => props.form.date || 'Date not set yet')

const timeSummary = computed(() => {
  if (!props.form.start_time && !props.form.end_time) return 'Time not set yet'
  const start = props.form.start_time || '—'
  const end = props.form.end_time || '—'
  return `${start} – ${end}`
})

const locationSummary = computed(() => props.form.location_id || 'Location not set')

const paySummary = computed(() => props.form.pay || 'Pay to be confirmed')
</script>
