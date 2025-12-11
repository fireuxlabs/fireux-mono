<template>
  <OrganismsCreateShell
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
      <OrganismsJobsCreatePreview :form="form" />
    </template>
  </OrganismsCreateShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import {
  useJobCreateState,
  jobStatusOptions,
  validateJobDraft,
  toJobPayload,
} from '../../../../composables/fireux/firestore/jobs/job/utils/useJobCreateState.ts'
import { useJobCreate } from '../../../../composables/fireux/firestore/jobs/job/mutations/useJobCreate.ts'

const router = useRouter()
const { withToast } = useToastify()
const { jobDraft: form, resetDraft } = useJobCreateState()
const { createJob } = useJobCreate()

const statusOptions = jobStatusOptions

const submitting = ref(false)
const errorMessage = ref('')
const isValid = computed(() => !validateJobDraft(form.value))

function onReset() {
  resetDraft()
  errorMessage.value = ''
}

const onSubmit = withToast(
  async () => {
    if (!isValid.value) return
    submitting.value = true
    errorMessage.value = ''

    try {
      const payload = toJobPayload(form.value)
      const id = await createJob(payload)

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

