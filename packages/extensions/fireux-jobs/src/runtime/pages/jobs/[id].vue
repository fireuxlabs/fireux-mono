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
        v-if="!job.value"
        title="Job not found"
        color="error"
        variant="soft"
      />

      <template v-else>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold">Basics</h3>
              <UBadge size="xs" variant="soft" :color="statusColor">
                {{ job.value?.status || 'draft' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <MoleculesFormsFirestoreSimpleField
              label="Title"
              :firebase-value="job.value?.title"
              placeholder="e.g. Sous Chef (Evenings)"
              :maxlength="80"
              :update-function="setTitle"
            />

            <MoleculesFormsFirestoreSimpleField
              label="Description"
              type="textarea"
              :rows="5"
              :firebase-value="job.value?.description"
              placeholder="Responsibilities, requirements, schedule…"
              :update-function="setDescription"
            />

            <MoleculesFormsFirestoreSimpleField
              label="Pay"
              :firebase-value="job.value?.pay ? String(job.value?.pay) : ''"
              placeholder="35 CHF/hour, negotiable"
              :update-function="setPay"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold">System</h3>
          </template>
          <div class="space-y-1 text-sm text-gray-500">
            <div><strong>Job ID:</strong> {{ job.value?.id }}</div>
            <div>
              <strong>Created by:</strong> {{ job.value?.created_by || '—' }}
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
import type { JobStatus } from '../../../models/job.model.ts'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'

const route = useRoute()
const paramId = route.params.id
const jobId = computed(() =>
  Array.isArray(paramId)
    ? paramId[0]?.toString() ?? null
    : paramId?.toString() ?? null
)

const { job } = useJobRead(jobId)
const { setTitle, setDescription, setPay, setStatus } = useJobEditor(job)
const { withToast } = useToastify()

const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(() =>
  job.value?.status ? `Status: ${job.value.status}` : 'Draft job'
)
const statusColor = computed(() => {
  if (job.value?.status === 'open') return 'success'
  if (job.value?.status === 'draft') return 'amber'
  return 'neutral'
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const statusLocal = ref<JobStatus>('draft')
watchEffect(() => {
  statusLocal.value = (job.value?.status as JobStatus) ?? 'draft'
})

const saving = ref(false)
const saveStatus = withToast(
  async () => {
    saving.value = true
    try {
      await setStatus(statusLocal.value)
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
