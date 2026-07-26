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

    <UAlert
      v-if="submitted"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      title="Application sent"
      description="You can follow its progress from My Work."
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
        <UButton
          type="submit"
          icon="i-lucide-send"
          :loading="submitting"
        >
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
import { ref } from 'vue'
import { applyToJobRequest } from '../../../composables/fireux/jobs/hiring/jobHiringClient'

const props = defineProps<{
  jobId: string
}>()

const message = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

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
  submitting.value = true
  errorMessage.value = ''
  try {
    await applyToJobRequest(props.jobId, { message: message.value })
    submitted.value = true
  } catch (error) {
    errorMessage.value = requestError(error)
  } finally {
    submitting.value = false
  }
}
</script>

