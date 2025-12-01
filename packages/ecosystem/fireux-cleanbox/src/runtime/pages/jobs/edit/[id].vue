<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="jobId ? `/jobs/${jobId}` : '/jobs'"
        >
          Back to job
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-14 rounded-xl" />
        <USkeleton class="h-40 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!job"
        color="error"
        variant="soft"
        title="Job not found"
        description="Return to the Cleanbox job list and try again."
      />

      <form v-else class="space-y-4" @submit.prevent="onSave">
        <UFormGroup label="Job title" required>
          <UInput v-model="form.title" placeholder="e.g. Overnight cleaner" />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Outline tasks, building size, and timing."
            :rows="6"
          />
        </UFormGroup>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormGroup label="Pay">
            <UInput
              v-model="form.pay"
              placeholder="35 CHF/hour"
              icon="i-lucide-badge-dollar-sign"
            />
          </UFormGroup>
          <UFormGroup label="Status" required>
            <USelect v-model="form.status" :options="statusOptions" />
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500"
            >Last updated {{ lastUpdated }}.</span
          >
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              :disabled="saving || !isDirty"
              @click="onReset"
            >
              Reset
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
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify.ts'
import type {
  Job,
  JobStatus,
} from '../../../../../../extensions/fireux-jobs/src/runtime/models/job.model.ts'

definePageMeta({
  layout: 'default',
})

useHead({ title: 'Edit Cleanbox Job' })

const route = useRoute()
const { withToast } = useToastify()
const { updateJob } = useJobUpdate()

const param = route.params.id
const jobId = computed(() =>
  Array.isArray(param)
    ? param[0]?.toString() ?? null
    : param?.toString() ?? null
)

const { job: jobRef, pending } = useJobRead(jobId)
const job = computed<Job | null>(() => jobRef.value)

const form = reactive({
  title: '',
  description: '',
  pay: '',
  status: 'draft' as JobStatus,
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const saving = ref(false)

watchEffect(() => {
  if (!job.value) return
  form.title = job.value.title ?? ''
  form.description = job.value.description ?? ''
  form.pay = job.value.pay != null ? String(job.value.pay) : ''
  form.status = (job.value.status as JobStatus) ?? 'draft'
})

const sanitize = (value: string) => value.trim()

const isDirty = computed(() => {
  if (!job.value) return false
  const baseTitle = job.value.title ?? ''
  const baseDescription = job.value.description ?? ''
  const basePay = job.value.pay != null ? String(job.value.pay) : ''
  const baseStatus = (job.value.status as JobStatus) ?? 'draft'

  return (
    sanitize(form.title) !== baseTitle.trim() ||
    sanitize(form.description) !== baseDescription.trim() ||
    sanitize(form.pay) !== basePay.trim() ||
    form.status !== baseStatus
  )
})

const toDate = (input: Job['created_at'] | Job['updated_at']) => {
  if (!input) return null
  if (input instanceof Date) return input
  if (typeof (input as any)?.toDate === 'function') {
    try {
      return (input as any).toDate()
    } catch {
      return null
    }
  }
  if (typeof input === 'string') {
    const parsed = Number.isNaN(Date.parse(input)) ? null : new Date(input)
    return parsed ?? null
  }
  return null
}

const lastUpdated = computed(() => {
  const timestamp = job.value?.updated_at || job.value?.created_at
  const date = toDate(timestamp)
  if (!date) return 'recently'
  return date.toLocaleString()
})

function onReset() {
  if (!job.value) return
  form.title = job.value.title ?? ''
  form.description = job.value.description ?? ''
  form.pay = job.value.pay != null ? String(job.value.pay) : ''
  form.status = (job.value.status as JobStatus) ?? 'draft'
}

const onSave = withToast(
  async () => {
    if (!job.value || !jobId.value || !isDirty.value) return
    saving.value = true
    const title = sanitize(form.title) || 'Untitled Job'
    const description = sanitize(form.description)
    const pay = sanitize(form.pay)

    try {
      await updateJob(jobId.value, {
        title,
        description: description ? description : null,
        pay: pay ? pay : null,
        status: form.status,
      })
    } finally {
      saving.value = false
    }
  },
  { ok: 'Job updated', fail: 'Failed to update job' }
)

const pageTitle = computed(() => form.title || 'Edit Cleanbox job')
const pageSubtitle = computed(() =>
  form.status === 'open'
    ? 'Published Cleanbox job'
    : form.status === 'closed'
    ? 'Closed job'
    : 'Draft job'
)
</script>
