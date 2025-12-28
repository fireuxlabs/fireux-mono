<template>
  <UPage>
    <UPageHeader :title="jobTitle" :description="jobSubtitle">
      <template #ctas>
        <USelect
          v-model="statusLocal"
          :options="statusOptions"
          size="xs"
          class="min-w-[9rem]"
        />
        <UButton size="xs" :loading="saving" @click="saveStatus">
          Save
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="!job"
        title="Job not found"
        color="error"
        variant="soft"
      />

      <template v-else>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold">Job overview</h3>
              <UBadge size="xs" variant="soft" :color="statusColor">
                {{ job?.status || 'open' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4 text-sm text-gray-600">
            <p class="text-base font-semibold text-gray-900">
              {{ job?.title || 'Untitled job' }}
            </p>
            <div class="grid gap-2 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-400">Job ID</p>
                <p class="font-medium">{{ job?.id }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-400">
                  Created by
                </p>
                <p class="font-medium">
                  {{ job?.created_by || '—' }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-400">
                  App
                </p>
                <p class="font-medium">
                  {{ job?.app_id || '—' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from 'nuxt/app'
import type { JobStatus } from '../../models/job.model'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useJobFetch } from '../../composables/fireux/firestore/jobs/fetch/useJobFetch'
import { useJobUpdate } from '../../composables/fireux/firestore/jobs/mutations/useJobUpdate'

const route = useRoute()
const paramId = route.params.id
const jobId = computed(() =>
  Array.isArray(paramId)
    ? paramId[0]?.toString() ?? null
    : paramId?.toString() ?? null
)

const { job } = useJobFetch(jobId)
const { updateJob } = useJobUpdate()
const { withToast } = useToastify()

const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(() =>
  job.value?.status ? `Status: ${job.value.status}` : 'Job pipeline entry'
)
const statusColor = computed(() =>
  job.value?.status === 'open' ? 'success' : 'neutral'
)

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const statusLocal = ref<JobStatus>('open')
watchEffect(() => {
  statusLocal.value = (job.value?.status as JobStatus) ?? 'open'
})

const saving = ref(false)
const saveStatus = withToast(
  async () => {
    const current = job.value
    if (!current?.id) {
      throw new Error('Job not ready to update')
    }
    saving.value = true
    try {
      await updateJob(current.id, { status: statusLocal.value })
    } finally {
      saving.value = false
    }
  },
  { ok: 'Status updated', fail: 'Failed to update status' }
)

definePageMeta({
  layout: 'default',
})

useHead(() => ({ title: jobTitle.value }))
</script>
