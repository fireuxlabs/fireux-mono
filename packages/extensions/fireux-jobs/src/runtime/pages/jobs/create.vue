<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Job"
      description="Draft a new job posting to share with professionals."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <OrganismsProfilesAgentCTA v-else-if="!canCreate" />

      <OrganismsCreateShell
        v-else
        :loading="submitting"
        submit-label="Create"
        @clear="onReset"
        @submit="onSubmit"
      >
        <template #write>
          <OrganismsJobsCreateWrite
            v-model:form="form"
            :status-options="statusOptions"
          />
        </template>

        <template #preview>
          <div class="space-y-2 text-sm text-gray-600">
            <p>
              <strong>{{ form.title || 'Untitled job' }}</strong>
            </p>
            <p v-if="form.date">Date: {{ form.date }}</p>
            <p v-if="form.start_time || form.end_time">
              Time: {{ form.start_time || '—' }} - {{ form.end_time || '—' }}
            </p>
            <p v-if="form.location_id">Location: {{ form.location_id }}</p>
            <p>Status: {{ form.status }}</p>
            <p v-if="form.pay">Pay: {{ form.pay }}</p>
            <p v-if="form.description">{{ form.description }}</p>
            <p v-if="form.notes">Notes: {{ form.notes }}</p>
          </div>
        </template>
      </OrganismsCreateShell>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import { useJobCreate } from '../../composables/fireux/firestore/jobs/job/mutations/useJobCreate.ts'
import type { JobStatus } from '../../models/job.model.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'jobs-create',
    label: 'Create job',
    icon: 'i-lucide-plus',
    order: 61,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
})

useHead({ title: 'Create Job' })

// Gate on agent core profile, matching /jobs index.
const { coreProfile, pending } = useAgent()

const isChecking = computed(() => Boolean(pending?.value))
const canCreate = computed(() => Boolean(coreProfile?.value))

const router = useRouter()
const { createJob } = useJobCreate()
const { withToast } = useToastify()

type JobForm = {
  title: string
  description: string
  notes: string
  pay: string
  status: JobStatus
  date: string
  start_time: string
  end_time: string
  location_id?: string
}

const form = reactive<JobForm>({
  title: '',
  description: '',
  notes: '',
  pay: '',
  status: 'draft',
  date: '',
  start_time: '',
  end_time: '',
  location_id: '',
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

const submitting = ref(false)
const errorMessage = ref('')
const isValid = computed(
  () => form.title.trim().length > 0 && Boolean(form.status)
)

function onReset() {
  form.title = ''
  form.description = ''
  form.notes = ''
  form.pay = ''
  form.status = 'draft'
  form.date = ''
  form.start_time = ''
  form.end_time = ''
  errorMessage.value = ''
}

const onSubmit = withToast(
  async () => {
    if (!isValid.value) return
    submitting.value = true
    errorMessage.value = ''

    try {
      const id = await createJob({
        title: form.title.trim(),
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        pay: form.pay.trim() || null,
        status: form.status,
        date: form.date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      })

      onReset()
      router.push(`/jobs/${id}`)
    } catch (error) {
      if (error instanceof Error) {
        errorMessage.value = error.message
      }
      throw error
    } finally {
      submitting.value = false
    }
  },
  { ok: 'Job created', fail: 'Unable to create job' }
)
</script>
