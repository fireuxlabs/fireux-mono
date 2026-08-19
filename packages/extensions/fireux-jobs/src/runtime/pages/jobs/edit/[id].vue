<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: edit the complete canonical Job authoring contract. -->
<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/jobs/manage"
        >
          Your jobs
        </UButton>
        <UButton
          v-if="isPublicAndOpen"
          :to="`/jobs/${encodeURIComponent(jobId || '')}`"
          size="xs"
          color="primary"
          variant="soft"
          icon="i-lucide-external-link"
        >
          Open job
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <JobAuthorFlowProgress :current-step="3" :published="isPublicAndOpen" />

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
        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]"
        >
          <div class="space-y-6">
            <UAlert
              color="neutral"
              variant="soft"
              icon="i-lucide-link-2"
              title="Employer and workplace"
              :description="`This job remains linked to Company ${form.company_id} and Place ${form.place_id}.`"
            />

            <JobCreateBasics
              v-model:form="form"
              step-label="Draft details"
              title="Job details"
              subtitle="Update the role, contract, schedule, openings, and optional compensation."
            />

            <UCard>
              <template #header>
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    Availability
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    Closed jobs stay in your workspace but disappear from public
                    discovery.
                  </p>
                </div>
              </template>
              <UFormField label="Status" required>
                <USelect v-model="status" :options="statusOptions" />
              </UFormField>
            </UCard>

            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default bg-muted/30 p-4"
            >
              <span class="text-sm text-muted">
                {{
                  isDirty
                    ? 'You have unsaved changes.'
                    : 'All draft changes are saved.'
                }}
              </span>
              <div class="flex items-center gap-2">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  :disabled="saving || publishing || !isDirty"
                  @click="onReset"
                >
                  Reset changes
                </UButton>
                <UButton
                  color="primary"
                  icon="i-lucide-save"
                  :loading="saving"
                  :disabled="publishing || !isDirty"
                  type="submit"
                >
                  Save changes
                </UButton>
              </div>
            </div>
          </div>

          <aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <JobCreatePreview :form="form" />
            <JobAuthorPublish
              :job="job"
              :status="status"
              :is-dirty="isDirty"
              :saving="saving"
              @published="onPublished"
              @publishing="publishing = $event"
            />
          </aside>
        </div>
      </form>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useHead } from 'nuxt/app'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useJobFetch } from '../../../job/composables/firestore/fetch/useJobFetch'
import {
  JobPayload,
  type JobCreateForm,
} from '../../../job/composables/firestore/mutations/useJobCreate'
import { useJobUpdate } from '../../../job/composables/firestore/mutations/useJobUpdate'
import type { Job, JobStatus } from '../../../job/models/job.model.ts'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
})

useHead({ title: 'Edit Job' })

const route = useRoute()
const { withToast } = useToastify()
const { updateJob } = useJobUpdate()

const routeParam = route.params.id
const jobId = computed(() =>
  Array.isArray(routeParam)
    ? (routeParam[0]?.toString() ?? null)
    : (routeParam?.toString() ?? null)
)

const { job: jobRef, pending, refresh } = useJobFetch(jobId)
const job = computed<Job | null>(() => jobRef.value)

function editForm(source?: Job | null): JobCreateForm {
  if (!source) return { ...JobPayload }
  return {
    company_id: source.company_id,
    place_id: source.place_id,
    category_id: source.category_id,
    contract_type: source.contract_type,
    management_mode: source.management_mode,
    openings_count: source.openings_count,
    compensation: source.compensation ? { ...source.compensation } : null,
    start_at: source.start_at,
    end_at: source.end_at,
    title: source.title,
    description: source.description,
  }
}

const form = ref<JobCreateForm>(editForm())
const status = ref<JobStatus>('open')
const saving = ref(false)
const publishing = ref(false)

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

watch(
  job,
  (current) => {
    if (!current) return
    form.value = editForm(current)
    status.value = current.status
  },
  { immediate: true }
)

function timestampKey(value: JobCreateForm['start_at']) {
  if (!value) return null
  const source = value as unknown as {
    seconds?: number
    nanoseconds?: number
    toMillis?: () => number
  }
  if (typeof source.toMillis === 'function') return source.toMillis()
  return [source.seconds ?? null, source.nanoseconds ?? 0]
}

function formKey(value: JobCreateForm, nextStatus: JobStatus) {
  return JSON.stringify({
    ...value,
    title: value.title.trim(),
    description: value.description.trim(),
    compensation: value.compensation
      ? {
          ...value.compensation,
          currency_code: value.compensation.currency_code.trim().toUpperCase(),
        }
      : null,
    start_at: timestampKey(value.start_at),
    end_at: timestampKey(value.end_at),
    status: nextStatus,
  })
}

const isDirty = computed(() =>
  Boolean(
    job.value &&
      formKey(form.value, status.value) !==
        formKey(editForm(job.value), job.value.status)
  )
)

function onReset() {
  if (!job.value) return
  form.value = editForm(job.value)
  status.value = job.value.status
}

const onSave = withToast(
  async () => {
    if (!job.value || !jobId.value || !isDirty.value || publishing.value) return
    saving.value = true
    const patch = {
      ...form.value,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      compensation: form.value.compensation
        ? {
            ...form.value.compensation,
            currency_code: form.value.compensation.currency_code
              .trim()
              .toUpperCase(),
          }
        : null,
      status: status.value,
    }

    try {
      await updateJob({ jobId: jobId.value, changes: patch })
      await refresh()
    } finally {
      saving.value = false
    }
  },
  { ok: 'Job updated', fail: 'Failed to update job' }
)

async function onPublished() {
  await refresh()
}

const pageTitle = computed(() => form.value.title || 'Edit job')
const pageSubtitle = computed(() =>
  job.value?.visibility === 'public' && job.value.status === 'open'
    ? 'Open job'
    : job.value?.status === 'closed'
      ? 'Closed job'
      : 'Private draft'
)
const isPublicAndOpen = computed(
  () => job.value?.visibility === 'public' && job.value.status === 'open'
)
</script>
