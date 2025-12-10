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
} from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'
import { useJobCreateSubmit } from '../../../../composables/fireux/firestore/jobs/job/mutations/useJobCreateSubmit.ts'

const router = useRouter()
const { withToast } = useToastify()
const { jobDraft: form, resetDraft } = useJobCreateState()
const { submit } = useJobCreateSubmit()

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
      const id = await submit()

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

