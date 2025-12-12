// FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue
// NOTE for Copilot:
// - This page is the ONLY entry point for creating jobs.
// - It delegates ALL form state + submission to useJobCreate().
// - The create flow is fake for now (no Firestore) but the UI and pipeline are real.
// - When wiring persistence, update useJobCreate.submit() only.

<template>
  <UPage>
    <UPageHeader
      title="Create Job"
      description="Draft a new job posting to share with professionals."
    />

    <UPageBody class="pagebody">
      <!-- Gate on agent profile (must be an agent to create jobs) -->
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <OrganismsProfilesAgentCTA v-else-if="!canPostJob" />

      <!-- Main create shell: write + preview -->
      <OrganismsCreateShell
        v-else
        :loading="submitting"
        submit-label="Create"
        @clear="onReset"
        @submit="onSubmit"
      >
        <template #write>
          <OrganismsJobsCreateWrite v-model:form="form" />
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
import { useHead, useRouter } from 'nuxt/app'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useJobPermissions } from '../../composables/useJobPermissions.ts'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import { useJobCreate } from '../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'

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

// Gate on agent profile (same rule as /jobs index)
const { agent, pending } = useAgent()
const { canPostJob } = useJobPermissions(agent)
const isChecking = computed(() => Boolean(pending?.value))

// Create flow: state + fake submit
const { form, reset, submit } = useJobCreate()

const router = useRouter()
const { withToast } = useToastify()
const submitting = ref(false)
const errorMessage = ref('')

function onReset() {
  reset()
  errorMessage.value = ''
}

const onSubmit = withToast(
  async () => {
    submitting.value = true
    errorMessage.value = ''

    try {
      const id = await submit()
      onReset()
      router.push(`/jobs/${id}`)
    } catch (err) {
      if (err instanceof Error) {
        errorMessage.value = err.message
      }
      throw err
    } finally {
      submitting.value = false
    }
  },
  { ok: 'Job created', fail: 'Unable to create job' }
)
</script>