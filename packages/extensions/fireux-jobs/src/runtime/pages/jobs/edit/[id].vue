<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="jobId ? `/jobs/${jobId}` : '/jobs'"
        >
          Back to details
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-14 rounded-xl" />
        <USkeleton class="h-40 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!job"
        color="error"
        variant="soft"
        title="Job not found"
        description="We could not find this job. Return to the jobs list and try again."
      />

      <form v-else class="space-y-6" @submit.prevent="onSave">
        <UFormField label="Job title" required>
          <UInput v-model="form.title" placeholder="e.g. Chef de Partie" />
        </UFormField>

        <UFormField label="Status" required>
          <USelect v-model="form.status" :options="statusOptions" />
        </UFormField>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">Update the title or lane.</span>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              :disabled="saving || !isDirty"
              @click="onReset"
            >
              Reset changes
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!isDirty"
              type="submit"
            >
              Save changes
            </UButton>
          </div>
        </div>
      </form>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useHead } from 'nuxt/app'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useJobFetch } from '../../../composables/fireux/firestore/jobs/fetch/useJobFetch'
import { useJobUpdate } from '../../../composables/fireux/firestore/jobs/mutations/useJobUpdate'
import type { Job, JobStatus } from '../../../models/job.model'

definePageMeta({
  layout: 'default',
})

useHead({ title: 'Edit Job' })

const route = useRoute()
const { withToast } = useToastify()
const { updateJob } = useJobUpdate()

const routeParam = route.params.id
const jobId = computed(() =>
  Array.isArray(routeParam)
    ? routeParam[0]?.toString() ?? null
    : routeParam?.toString() ?? null
)

const { job: jobRef, pending } = useJobFetch(jobId)

const job = computed<Job | null>(() => jobRef.value)

const form = reactive({
  title: '',
  status: 'open' as JobStatus,
})

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const saving = ref(false)

watchEffect(() => {
  if (!job.value) return
  form.title = job.value.title ?? ''
  form.status = (job.value.status as JobStatus) ?? 'open'
})

const sanitize = (value: string) => value.trim()

const isDirty = computed(() => {
  if (!job.value) return false
  const baseTitle = job.value.title ?? ''
  const baseStatus = (job.value.status as JobStatus) ?? 'open'

  return (
    sanitize(form.title) !== baseTitle.trim() ||
    form.status !== baseStatus
  )
})

function onReset() {
  if (!job.value) return
  form.title = job.value.title ?? ''
  form.status = (job.value.status as JobStatus) ?? 'open'
}

const onSave = withToast(
  async () => {
    if (!job.value || !jobId.value || !isDirty.value) return
    saving.value = true
    const title = sanitize(form.title) || 'Untitled Job'

    try {
      await updateJob(jobId.value, {
        title,
        status: form.status,
      })
    } finally {
      saving.value = false
    }
  },
  { ok: 'Job updated', fail: 'Failed to update job' }
)

const pageTitle = computed(() => form.title || 'Edit job')
const pageSubtitle = computed(() =>
  form.status === 'open' ? 'Open job' : 'Closed job'
)
</script>
