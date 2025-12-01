<!-- fireux-jobs/src/runtime/components/Organisms/Jobs/Create.vue -->

<template>
  <section>
    <form @submit.prevent="onSubmit">
      <UCard>
        <template #header>
          <p>Job basics</p>
          <strong>Tell us about this role</strong>
          <p>Keep the title and summary short—professionals skim quickly.</p>
          <UBadge variant="soft" color="primary">
            {{ currentStatusMeta.label }}
          </UBadge>
        </template>

        <UFormGroup label="Job title" required>
          <UInput
            v-model="form.title"
            placeholder="e.g. Sous Chef (Evenings)"
          />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Responsibilities, requirements, schedule…"
            :rows="6"
          />
        </UFormGroup>
      </UCard>

      <UCard>
        <template #header>
          <p>Publish controls</p>
          <strong>Pay & visibility</strong>
          <p>Decide what the shift pays and who can find it in the network.</p>
        </template>

        <UFormGroup label="Pay">
          <UInput
            v-model="form.pay"
            placeholder="35 CHF/hour, negotiable"
            icon="i-lucide-badge-dollar-sign"
          />
        </UFormGroup>

        <UFormGroup label="Status" required>
          <USelect v-model="form.status" :options="statusOptions" />
        </UFormGroup>

        <div>
          <p>{{ currentStatusMeta.label }}</p>
          <p>{{ currentStatusMeta.copy }}</p>

          <ul>
            <li v-for="meta in statusMetaList" :key="meta.value">
              <strong>{{ meta.label }}</strong>
              <p>{{ meta.copy }}</p>
            </li>
          </ul>
        </div>
      </UCard>

      <p v-if="errorMessage">{{ errorMessage }}</p>

      <footer>
        <p>Jobs stay private until you switch the status to “Open”.</p>
        <div>
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
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify.ts'
import { useJobCreate } from '../../../composables/firestore/jobs/main/useJobCreate.ts'
import type { JobStatus } from '../../../models/job.model.ts'

const router = useRouter()
const { createJob } = useJobCreate()
const { withToast } = useToastify()

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

const statusMeta: Record<JobStatus, { label: string; copy: string }> = {
  draft: {
    label: 'Draft',
    copy: 'Keep working on the posting privately until you are ready to share it.',
  },
  open: {
    label: 'Open',
    copy: 'Visible to professionals across FireUX and eligible tenant apps.',
  },
  closed: {
    label: 'Closed',
    copy: 'Hide the post from talent while keeping it for your own records.',
  },
}

const statusMetaList = Object.entries(statusMeta).map(([value, meta]) => ({
  value: value as JobStatus,
  ...meta,
}))

const submitting = ref(false)
const errorMessage = ref('')
const isValid = computed(
  () => form.title.trim().length > 0 && Boolean(form.status)
)

const currentStatusMeta = computed(() => statusMeta[form.status])

function onReset() {
  form.title = ''
  form.description = ''
  form.pay = ''
  form.status = 'draft'
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
        pay: form.pay.trim() || null,
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
