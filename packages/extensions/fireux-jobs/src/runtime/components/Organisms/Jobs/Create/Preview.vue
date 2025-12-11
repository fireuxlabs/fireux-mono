<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Preview</p>
          <h3 class="text-base font-semibold text-gray-900">
            {{ title }}
          </h3>
        </div>
        <UBadge :color="statusColor" variant="soft">
          {{ statusLabel }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3 text-sm text-gray-600">
      <p>
        This is the exact card that appears in the pipeline and quick preview.
      </p>
      <div class="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-400">Status</p>
        <p class="text-base font-semibold text-gray-900">{{ statusLabel }}</p>
        <p class="text-sm text-gray-500">{{ statusDescription }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobDraft } from '../../../../composables/fireux/firestore/jobs/utils/useJobCreateState.ts'
import {
  defaultJobStatus,
  jobStatusMeta,
  type JobStatusMeta,
} from '../../../../composables/fireux/firestore/jobs/utils/useJobCreateState.ts'

const props = defineProps<{ form: JobDraft }>()

const toneMap: Record<JobStatusMeta['tone'], string> = {
  neutral: 'gray',
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
}

const statusMeta = computed(
  () => jobStatusMeta[props.form.status] ?? jobStatusMeta[defaultJobStatus]
)

const statusColor = computed(() => toneMap[statusMeta.value.tone])
const statusLabel = computed(() => statusMeta.value.label)
const statusDescription = computed(() => statusMeta.value.description)
const title = computed(() => props.form.title.trim() || 'Untitled job')
</script>
