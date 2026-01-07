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

    <div v-if="cards.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <OrganismsProfilesAgentCardsPill
        v-for="card in cards"
        :key="cardKey(card)"
        v-bind="card"
      />
    </div>

    <p v-else class="text-sm opacity-70">No global agents found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCore } from '../../../../../models/profiles/Agent/Agent.model'
import type { AgentCard } from '../../../../../types/profiles/AgentCard'
import { useAgentCollection } from '../../../../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { globalAgents } = useAgentCollection()
const { card } = useAgent()

const total = computed(() => globalAgents.value?.length ?? 0)

const cards = computed<AgentCard.Card[]>(() =>
  (globalAgents.value ?? []).map((agent: AgentCore) => card(agent))
)

const cardKey = (payload: AgentCard.Card) => payload.id || payload.to || payload.title
</script>
