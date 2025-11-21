<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfileSectionsSingle
          :cell="cell"
          :pill="pill"
          :has-profile="hasProfile"
          :header-title="currentProfileTitle"
          empty-message="No agent profile loaded."
          card-cell-component="OrganismsProfilesAgentCardsCell"
          card-cell-prop="agent"
          card-pill-component="OrganismsProfilesAgentCardsPill"
          card-pill-prop="agent"
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
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
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

const { pill, cell } = useAgent()

const { isTenant } = useFireUXConfig()
const { hasProfile: userHasProfile } = useUser()

const hasProfile = computed(() => userHasProfile('agent'))

const pageTitle = 'Agents'
const pageDescription =
  'Inspect your agent profile and browse all agents resolved for this runtime.'
const currentProfileTitle = 'Your agent profile'

useHead({ title: pageTitle })
</script>
