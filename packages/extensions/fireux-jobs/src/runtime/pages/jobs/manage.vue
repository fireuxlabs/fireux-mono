<template>
  <UPage>
    <UPageHeader
      title="Your jobs"
      description="Create private drafts, review each posting, and publish when it is ready."
    >
      <template #ctas>
        <UButton
          to="/jobs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-search"
        >
          Browse jobs
        </UButton>
        <UButton
          v-if="canPostJob"
          to="/jobs/create"
          color="primary"
          icon="i-lucide-plus"
        >
          Create draft
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <JobAuthorFlowProgress v-if="!canPostJob" :current-step="1" />

      <div v-if="isChecking" class="space-y-3">
        <USkeleton class="h-24 rounded-2xl" />
        <USkeleton class="h-48 rounded-2xl" />
      </div>

      <JobAuthorGate
        v-else-if="!canPostJob"
        :readiness="authorReadiness"
        return-to="/jobs/manage"
      />

      <template v-else>
        <UCard v-if="agentCard" variant="subtle">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.18em] text-primary"
              >
                Employer workspace
              </p>
              <p class="mt-1 text-sm text-muted">
                Every posting is owned by this Agent identity and linked to a
                Company and Place.
              </p>
            </div>
            <AgentCardsPill
              v-bind="agentCard"
              :show-subtitle="false"
              :link="Boolean(agentCard.to)"
              class="min-w-64"
            />
          </div>
        </UCard>

        <JobSectionsAgentCollection />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useJobPermissions } from '../../composables/useJobPermissions'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Your jobs',
})

useHead({ title: 'Your jobs' })

const { agent, coreProfile, pending, pill: agentInterface } = useAgent()
const { authorReadiness, canPostJob, isChecking } = useJobPermissions(
  agent,
  pending
)
const agentCard = computed(() =>
  coreProfile.value ? agentInterface(coreProfile.value) : null
)
</script>
