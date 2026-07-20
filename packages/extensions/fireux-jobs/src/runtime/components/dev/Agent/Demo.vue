<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-highlighted">Agent card surfaces</p>
        <p class="text-xs text-muted">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <AgentCardsPill
          v-for="(pillItem, index) in pillList"
          :key="pillItem.displayName"
          v-bind="pillItem"
          action
          @action="selectedIndex = index"
        />
      </div>

      <AgentCardsPill v-if="current.pill" v-bind="current.pill" />
      <AgentCardsCell v-if="current.cell" v-bind="current.cell" />
      <AgentCardsPreview v-if="current.preview" v-bind="current.preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: keep demo Agent and User fixtures as separate surfaces.
defineOptions({ name: 'DevAgentDemo' })

import { computed, ref } from 'vue'
import { AgentModel, type Agent } from '../../../models/profiles/Agent/Agent.model'
import {
  useAgentInterface,
  type AgentCard,
} from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'

type DemoAgentSurface = {
  agent: Agent
  user: {
    id: string
    display_name: string
    avatar: string
    handle: string
    email: string
  }
}

const demoAgents: DemoAgentSurface[] = [
  {
    agent: {
      ...AgentModel,
      id: 'agent-demo-mila',
      title: 'Hospitality placements',
      summary: 'Matchmaking kitchens with talent across Europe.',
      agent_placement_types: ['Alpine', 'Executive'],
      agent_contact_email: 'mila@example.test',
    },
    user: {
      id: 'agent-demo-mila',
      display_name: 'Mila Harbor',
      avatar: '',
      handle: 'mila-harbor',
      email: 'mila@example.test',
    },
  },
  {
    agent: {
      ...AgentModel,
      id: 'agent-demo-sofia',
      title: 'Private chef placements',
      summary: 'Pairs premium kitchens with executive-level talent.',
      agent_placement_types: ['Private', 'Seasonal'],
      agent_contact_email: 'sofia@example.test',
    },
    user: {
      id: 'agent-demo-sofia',
      display_name: 'Sofia Keller',
      avatar: '',
      handle: 'sofia-keller',
      email: 'sofia@example.test',
    },
  },
]

const { pill, cell, preview } = useAgentInterface()
const isAgentCard = (card: AgentCard.Card | null): card is AgentCard.Card =>
  Boolean(card)
const pillList = computed(() =>
  demoAgents.map(({ agent, user }) => pill(agent, user)).filter(isAgentCard)
)
const cellList = computed(() =>
  demoAgents.map(({ agent, user }) => cell(agent, user)).filter(isAgentCard)
)
const previewList = computed(() =>
  demoAgents.map(({ agent, user }) => preview(agent, user)).filter(isAgentCard)
)

const selectedIndex = ref(0)

const current = computed(() => ({
  pill: pillList.value[selectedIndex.value] ?? pillList.value[0],
  cell: cellList.value[selectedIndex.value] ?? cellList.value[0],
  preview: previewList.value[selectedIndex.value] ?? previewList.value[0],
}))
</script>
