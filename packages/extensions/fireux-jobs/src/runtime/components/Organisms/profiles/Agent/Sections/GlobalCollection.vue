<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Global agents</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Agents available across the FireUX network.
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesAgentCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :agent="pill"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global agents found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentInterface.ts'
import { useAgentCollection } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection.ts'
import {
  resolveAgentPill,
  resolveAgentPillKey,
} from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentInterface.ts'

const { globalAgents } = useAgentCollection()

const total = computed(() => globalAgents.value?.length ?? 0)

const pills = computed<AgentCard.Pill[]>(() =>
  (globalAgents.value ?? []).map((agent: AgentProfile) =>
    resolveAgentPill(agent)
  )
)

const pillKey = resolveAgentPillKey
</script>
