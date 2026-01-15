<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsProfilesAgentCTA />
      <OrganismsProfilesAgentCollectionManager :cards="cards" :total="total" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgentsInterface } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface'

definePageMeta({
  nav: {
    key: 'agents',
    label: 'Agents',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Agents',
  description: 'Agent profiles resolved for this runtime.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Agents'
const pageDescription =
  'Inspect your agent profile and browse all agents available to this runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { globalAgents, localAgents } = useAgentCollection()
const { card: makeCard } = useAgentsInterface()

const cards = computed(() => {
  const globalCards = (globalAgents.value ?? [])
    .map((entry) => makeCard(entry as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const localCards = (localAgents.value ?? [])
    .map((entry) => makeCard(entry as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  return [...localCards, ...globalCards]
})

const total = computed(() => cards.value.length)
</script>
