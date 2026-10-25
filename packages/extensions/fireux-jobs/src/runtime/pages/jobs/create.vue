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

        <FireCreateShell
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
        </FireCreateShell>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 12:53 CEST — Job authoring: send new drafts to the authenticated edit route.
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useHead, useRouter } from 'nuxt/app'
import { computed, ref, watch } from 'vue'
import { useJobCreate } from '../../job/composables/firestore/mutations/useJobCreate.ts'
import { useAgent } from '../../user/composables/profiles/Agent/useAgent.ts'
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

const { agent, agentProfile, pending, pill: agentInterface } = useAgent()
const { authorReadiness, canPostJob, isChecking } = useJobPermissions(
  agent,
  pending
)
const agentCard = computed(() =>
  agentProfile.value ? agentInterface(agentProfile.value) : null
)

const { form, reset, submit, captureIntent, scopeEpoch } = useJobCreate()

const router = useRouter()
const toast = useToastify()
const submitting = ref(false)
const errorMessage = ref('')
watch(scopeEpoch, () => { submitting.value = false; errorMessage.value = '' }, { flush: 'sync' })

function onReset() {
  reset()
  errorMessage.value = ''
}

async function onSubmit() {
  if (submitting.value) return
  const isCurrent = captureIntent()
  submitting.value = true
  errorMessage.value = ''
  try {
    const id = await submit()
    if (!isCurrent()) return
    onReset()
    toast.success('Draft created')
    await router.push(`/jobs/edit/${encodeURIComponent(id)}`)
  } catch (error) {
    if (!isCurrent()) return
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create draft'
    toast.error(errorMessage.value)
  } finally { if (isCurrent()) submitting.value = false }
}
</script>
