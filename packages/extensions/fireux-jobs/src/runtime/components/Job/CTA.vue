<template>
  <div class="space-y-6" data-entity-cta-family="domain-managed">
    <!-- Agent can post jobs -->
    <UPageCTA
      v-if="hasAgentProfile"
      class="cta"
      title="Post a job"
      :description="agentCtaDescription"
      variant="naked"
    >
      <template #default>
        <div class="cta__body space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              size="sm"
              variant="soft"
              @click="showForm = !showForm"
            >
              {{ showForm ? 'Hide job form' : 'Create job' }}
            </UButton>
          </div>

          <div v-if="showForm">
            <JobCreateSystem />
          </div>

          <!-- DEV sanity output -->
          <pre
            v-if="showCheck"
            class="text-xs text-slate-500 whitespace-pre-wrap"
          >{{ JSON.stringify(check, null, 2) }}</pre>
        </div>
      </template>
    </UPageCTA>

    <!-- Professional-only path -->
    <ProfessionalCTA v-else-if="hasProfessionalProfile" />

    <!-- No profiles yet -->
    <div v-else class="space-y-6">
      <ProfessionalCTA />
      <AgentCTA />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { computed, ref } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { appName, ecosystem, isTenant } = useFireUXConfig()
const { hasProfile } = useUser()
const { coreProfile } = useAgent()

const hasAgentProfile = computed(() => hasProfile('agent'))
const hasProfessionalProfile = computed(() => hasProfile('professional'))
const showForm = ref(false)

const agentCtaScopeLabel = computed(() => (isTenant ? appName : ecosystem))
const agentCtaDescription = computed(
  () => `Create a job posting to reach professionals across ${agentCtaScopeLabel.value}.`
)

const showCheck = import.meta.dev

/**
 * DEV sanity check (temporary)
 */
const check = computed(() => {
  if (!hasAgentProfile.value) {
    return { status: 'no-agent-profile' }
  }

  if (!coreProfile.value) {
    return { status: 'agent-profile-missing' }
  }

  const agent = coreProfile.value

  const missing: string[] = []

  if (!agent.title) missing.push('title')
  if (!agent.contact_email) missing.push('contact_email')
  if (!agent.website_url) missing.push('website_url')
  if (!agent.summary) missing.push('summary')

  return {
    status: missing.length ? 'incomplete' : 'ready',
    agentId: agent.id ?? null,
    missing,
  }
})
</script>
