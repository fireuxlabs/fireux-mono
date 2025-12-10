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
          <OrganismsJobsCreatePreview :form="form" />
        </template>
      </OrganismsCreateShell>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import {
  useJobCreateState,
  jobStatusOptions,
  validateJobDraft,
} from '../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'
import { useJobCreateSubmit } from '../../composables/fireux/firestore/jobs/job/mutations/useJobCreateSubmit.ts'

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
  title: 'Create Job',
})

useHead({ title: 'Create Job' })

// Gate on agent core profile, matching /jobs index.
const { coreProfile, pending } = useAgent()

const isChecking = computed(() => Boolean(pending?.value))
const canCreate = computed(() => Boolean(coreProfile?.value))

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
