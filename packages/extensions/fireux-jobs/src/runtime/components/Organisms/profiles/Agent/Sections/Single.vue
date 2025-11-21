<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesAgentCardsCell
          v-if="cell"
          :agent="cell"
          class="max-w-xl"
        />
        <OrganismsProfilesAgentCardsPill
          v-if="pill"
          :agent="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No agent profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  AgentProfile,
  AgentCard,
} from '../../../../../models/profiles/Agent.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const props = defineProps<{
  coreProfile: AgentProfile | null | undefined
  appProfile?: Partial<AgentProfile> | null | undefined
  pill: AgentCard.Pill | null
}>()

const { coreUser } = useUser()

const cell = computed<AgentCard.Cell | null>(() => {
  const profile = props.coreProfile ?? null
  if (!profile) return null

  const tagline =
    profile.tagline ?? (profile as { subtitle?: string | null })?.subtitle ?? ''

  return {
    id: profile.id ?? profile.user?.id ?? 'agent-profile',
    avatar: profile.user?.avatar ?? undefined,
    title: profile.user?.display_name ?? profile.title ?? 'Agent',
    subtitle: tagline,
    tagline,
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: profile.id ? `/agents/${profile.id}` : undefined,
  }
})
</script>
