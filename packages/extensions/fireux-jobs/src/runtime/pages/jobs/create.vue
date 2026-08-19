<template>
  <UPage>
    <UPageHeader
      title="Post a job"
      description="Build a private draft, review it, then publish when it is ready."
    >
      <template #ctas>
        <UButton
          to="/jobs/manage"
          color="neutral"
          variant="ghost"
          icon="i-lucide-list-checks"
        >
          Your jobs
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <JobAuthorFlowProgress :current-step="canPostJob ? 2 : 1" />

      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <JobAuthorGate
        v-else-if="!canPostJob"
        :readiness="authorReadiness"
        return-to="/jobs/create"
      />

      <div v-else class="space-y-3">
        <UCard v-if="agentCard" variant="subtle">
          <template #header>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-widest text-primary"
              >
                Posting as
              </p>
              <h2 class="mt-1 text-base font-semibold text-highlighted">
                Your hiring profile owns this draft
              </h2>
            </div>
          </template>
          <AgentCardsPill
            v-bind="agentCard"
            :show-subtitle="false"
            :link="Boolean(agentCard.to)"
          />
        </UCard>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Draft could not be created"
          :description="errorMessage"
        />

        <MoleculesCreateShell
          :loading="submitting"
          submit-label="Create draft"
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
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useHead, useRouter } from 'nuxt/app'
import { computed, ref } from 'vue'
import { useJobCreate } from '../../job/composables/firestore/mutations/useJobCreate.ts'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useJobPermissions } from '../../job/composables/useJobPermissions.ts'

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
  title: 'Post a job',
  requiresAuth: true,
})

useHead({ title: 'Post a job' })

const { agent, coreProfile, pending, pill: agentInterface } = useAgent()
const { authorReadiness, canPostJob, isChecking } = useJobPermissions(
  agent,
  pending
)
const agentCard = computed(() =>
  coreProfile.value ? agentInterface(coreProfile.value) : null
)

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
      await router.push(`/jobs/edit/${encodeURIComponent(id)}`)
    } catch (err) {
      if (err instanceof Error) {
        errorMessage.value = err.message
      }
      throw err
    } finally {
      submitting.value = false
    }
  },
  { ok: 'Draft created', fail: 'Unable to create draft' }
)
</script>
