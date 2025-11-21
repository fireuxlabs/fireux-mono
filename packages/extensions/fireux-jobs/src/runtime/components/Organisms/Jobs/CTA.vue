<template>
  <OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />

  <UPageCTA
    v-else
    title="Post a job"
    description="Create a job posting to reach professionals across this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsProfilesAgentCardsCell
        v-if="agentCell"
        :agent="agentCell"
        class="cta-agent-cell"
      />

      <div v-else class="cta-agent-placeholder">
        Agent profile details will appear here when available.
      </div>

      <div class="cta-agent-meta" aria-hidden="true">
        <!-- Reserved space for future agent/job summary metrics -->
      </div>
    </template>

    <template #links>
      <UButton color="primary" size="lg" to="/jobs/create">
        Create job posting
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../composables/firestore/profiles/Agent/useAgent.ts'
import OrganismsProfilesAgentCardsCell from '../profiles/Agent/Cards/Cell.vue'
import type { AgentCard } from '../../../models/profiles/Agent.model.ts'

const { coreProfile } = useAgent()
const hasAgentProfile = computed(() => Boolean(coreProfile.value))

const agentCell = computed<AgentCard.Cell | null>(() => {
  const profile = coreProfile.value
  if (!profile) return null

  return {
    id: profile.id ?? profile.user?.id ?? 'agent-profile',
    avatar: profile.user?.avatar ?? undefined,
    title: profile.user?.display_name ?? profile.title ?? 'Agent',
    subtitle: profile.subtitle ?? '',
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: profile.id ? `/agents/${profile.id}` : undefined,
  }
})
</script>

<style scoped>
.cta-agent-cell {
  margin-bottom: 1.5rem;
}

.cta-agent-placeholder {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: #475569;
}

.cta-agent-meta {
  min-height: 2.5rem;
}
</style>
