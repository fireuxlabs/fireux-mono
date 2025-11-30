<template>
  <OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />
  <UPageCTA
    v-else
    title="Post a job"
    description="Create a job posting to reach professionals across this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsProfileSectionsSingle :title="currentProfileTitle">
        <OrganismsProfilesAgentCardsCell
          v-if="cell"
          :agent="cell"
          class="cta-agent-cell"
        />
        <OrganismsProfilesAgentCardsPill v-if="pill" :agent="pill" />
      </OrganismsProfileSectionsSingle>
    </template>

    <template #links>
      <UButton
        color="primary"
        size="lg"
        to="/jobs/create"
        @click="handleCreateJob"
      >
        Create job posting
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgent } from '../../../composables/firestore/profiles/Agent/useAgent.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const router = useRouter()
const { pill, cell } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))
const currentProfileTitle = 'Your agent profile'

const handleCreateJob = () => {
  router.push('/jobs/create').catch(() => undefined)
}
</script>

<style scoped>
.cta-agent-cell {
  margin-bottom: 1.5rem;
}
</style>
