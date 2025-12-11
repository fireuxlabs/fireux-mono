<!-- fireux-jobs/src/runtime/components/Organisms/Jobs/Create.vue -->

<template>
  <section>
    <form @submit.prevent="onSubmit">
      <UCard>
        <template #header>
          <p>Job basics</p>
          <strong>Lock the pipeline tile</strong>
          <p>Keep the title short so it fits neatly in the board.</p>
          <UBadge variant="soft" color="primary">
            {{ currentStatusMeta.label }}
          </UBadge>
        </template>

        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-semibold">
              Job title <span class="text-red-500">*</span>
            </p>
            <UInput
              v-model="form.title"
              placeholder="e.g. Sous Chef (Evenings)"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p>Pipeline lane</p>
          <strong>Status & visibility</strong>
          <p>Pick the lane you want this job to live in.</p>
        </template>

        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-semibold">
              Status <span class="text-red-500">*</span>
            </p>
            <USelect v-model="form.status" :options="statusOptions" />
          </div>

          <div>
            <p class="text-sm font-semibold">{{ currentStatusMeta.label }}</p>
            <p class="text-sm text-gray-600">{{ currentStatusMeta.copy }}</p>

            <ul class="mt-3 space-y-2">
              <li v-for="meta in statusMetaList" :key="meta.value">
                <strong>{{ meta.label }}</strong>
                <p class="text-sm text-gray-600">{{ meta.copy }}</p>
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

      <footer class="flex items-center justify-between">
        <p>Jobs stay visible only to you until you set them to "Open".</p>
        <div class="flex items-center gap-2">
          <UButton variant="ghost" :disabled="submitting" @click="onReset">
            Clear
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            :disabled="!isValid"
            type="submit"
          >
            Create job
          </UButton>
        </div>
      </footer>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import { useJobCreate } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'
import type { JobStatus } from '#fireux-jobs-models/job.model'

const router = useRouter()
const { createJob } = useJobCreate()
const { withToast } = useToastify()

const form = reactive({
  title: '',
  status: 'open' as JobStatus,
})

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const statusMeta: Record<JobStatus, { label: string; copy: string }> = {
  open: {
    label: 'Open',
    copy: 'Visible to professionals across FireUX and eligible tenant apps.',
  },
  closed: {
    label: 'Closed',
    copy: 'Hidden from talent but kept in your internal history.',
  },
}

const statusMetaList = Object.entries(statusMeta).map(([value, meta]) => ({
  value: value as JobStatus,
  ...meta,
}))

const submitting = ref(false)
const errorMessage = ref('')
const isValid = computed(() => form.title.trim().length > 0)

const currentStatusMeta = computed(() => statusMeta[form.status])

function onReset() {
  form.title = ''
  form.status = 'open'
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
        status: form.status,
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
