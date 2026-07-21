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

      <AgentCTA v-else-if="!canPostJob" />

      <!-- Main create shell: write + preview -->
      <div v-else class="space-y-3">
        <MoleculesCreateShell
          :loading="submitting"
          submit-label="Create"
          @clear="onReset"
          @submit="onSubmit"
        >
          <template #write>
            <JobCreateWrite v-model:form="form" />
          </template>

          <template #preview>
            <JobCreatePreview :form="form" />
          </template>
        </MoleculesCreateShell>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: send new private drafts to the authenticated edit route.
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import { useHead, useRouter } from 'nuxt/app'
import { computed, ref } from 'vue'
import { useJobCreate } from '../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useJobPermissions } from '../../composables/useJobPermissions.ts'

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
  requiresAuth: true,
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
      router.push(`/jobs/edit/${encodeURIComponent(id)}`)
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
