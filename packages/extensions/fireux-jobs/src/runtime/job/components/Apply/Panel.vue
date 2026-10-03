<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h3 class="font-semibold">Apply for this job</h3>
        <p class="text-xs text-muted">
          Your Professional profile is shared privately with the employer.
        </p>
      </div>
    </template>

    <div v-if="applicationDoorway" class="space-y-4">
      <UAlert
        color="primary"
        variant="soft"
        icon="i-lucide-map-pinned"
        title="Apply with the local app"
        description="This opportunity is managed by its local community. Continue there to sign in and apply."
      />
      <UButton
        :to="applicationDoorway.url"
        :label="applicationDoorway.label"
        icon="i-lucide-arrow-up-right"
        block
      />
    </div>

    <UAlert
      v-else-if="submitted"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      title="Application sent"
      description="You can follow its progress from Applications & work."
    />

    <form v-else class="space-y-4" @submit.prevent="submit">
      <UFormField label="Message" hint="Optional">
        <UTextarea
          v-model="message"
          :maxlength="2000"
          :rows="4"
          autoresize
          placeholder="Introduce yourself or mention anything relevant to this role."
        />
      </UFormField>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Application not sent"
        :description="errorMessage"
      />

      <div class="flex flex-wrap gap-2">
        <UButton type="submit" icon="i-lucide-send" :loading="submitting">
          Apply
        </UButton>
        <UButton
          to="/dashboard/professional/profile"
          color="neutral"
          variant="soft"
          icon="i-lucide-user-round"
        >
          Review profile
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { JobApplicationDoorway } from '../../models/job-collection.model.ts'
import { useJobHiringCommands } from '../../composables/hiring/jobHiringClient'

const props = defineProps<{
  jobId: string
  applicationDoorway?: JobApplicationDoorway
}>()

const { applyToJobRequest, captureIntent, scopeEpoch } = useJobHiringCommands([() => props.jobId])
const message = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
watch(scopeEpoch, () => { submitting.value = false; submitted.value = false; errorMessage.value = '' }, { flush: 'sync' })

function requestError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Please sign in and complete your Professional profile before applying.'
  }
  const candidate = error as {
    data?: { statusMessage?: unknown; message?: unknown }
    statusMessage?: unknown
    message?: unknown
  }
  return String(
    candidate.data?.statusMessage ??
      candidate.statusMessage ??
      candidate.data?.message ??
      candidate.message ??
      'Please sign in and complete your Professional profile before applying.'
  )
}

async function submit() {
  if (submitting.value || submitted.value) return
  const isCurrent = captureIntent()
  submitting.value = true
  errorMessage.value = ''
  try {
    await applyToJobRequest(props.jobId, { message: message.value })
    if (isCurrent()) submitted.value = true
  } catch (error) {
    if (isCurrent()) errorMessage.value = requestError(error)
  } finally {
    if (isCurrent()) submitting.value = false
  }
}
</script>
