<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Agents"
      description="Inspect your agent profile and browse all agents resolved for this runtime."
    />
    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesAgentSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <OrganismsProfilesAgentCTA v-else />

      <OrganismsProfilesAgentSectionsGlobalCollection />
      <OrganismsProfilesAgentSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent.ts'

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

const { coreProfile, appProfile, pill } = useAgent()

const { isTenant } = useFireUXConfig()

const hasProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Agents' })
</script>
