<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
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
import type {
  AgentProfile,
  AgentCard,
} from '../../../../../models/profiles/Agent.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

defineProps<{
  coreProfile: AgentProfile | null | undefined
  appProfile?: Partial<AgentProfile> | null | undefined
  pill: AgentCard.Pill | null
}>()

const { coreUser } = useUser()
</script>
