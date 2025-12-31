<template>
  <OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />
  <UPageCTA
    v-else
    title="Post a job"
    description="Create a job posting to reach professionals across this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2>{{ currentProfileTitle }}</h2>
          </template>

          <div class="space-y-4">
            <OrganismsProfilesAgentCardsCell
              v-if="cell"
              :agent="cell"
              class="cta-agent-cell"
            />
            <OrganismsProfilesAgentCardsPill v-if="pill" :agent="pill" />
          </div>
        </UCard>
      </div>
    </template>

    <template #links>
      <UButton
        color="primary"
        size="lg"
        to="/jobs/create"
      >
        Create job posting
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const { pill, cell } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))
const currentProfileTitle = 'Your agent profile'
</script>

<style scoped>
.cta-agent-cell {
  margin-bottom: 1.5rem;
}
</style>
