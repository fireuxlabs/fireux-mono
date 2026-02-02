<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsProfilesAgentCTA />
      <OrganismsProfilesAgentCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useAgentFetch } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentFetch'

definePageMeta({
  nav: {
    key: 'agents',
    label: 'Agents',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: false,
    mobile: false,
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

const { globalAgents, localAgents } = useAgentFetch()
const collection = computed(() => [
  ...(localAgents?.value ?? []),
  ...(globalAgents.value ?? []),
])

</script>
