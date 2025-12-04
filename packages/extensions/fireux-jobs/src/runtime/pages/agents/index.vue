<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="space-y-6">
      <OrganismsProfilesAgentPreview />

      <OrganismsProfilesAgentSectionsLocalCollection v-if="isTenant" />

      <section class="space-y-2">
        <div v-if="isTenant" class="flex items-center justify-end">
          <UButton
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{
              showGlobalDirectory ? 'Hide global agents' : 'View global agents'
            }}
          </UButton>
        </div>

        <OrganismsProfilesAgentSectionsGlobalCollection
          v-if="showGlobalDirectory || !isTenant"
        />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

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

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant.value)

const pageTitle = 'Agents'
const pageDescription =
  'Inspect your agent profile and browse all agents resolved for this runtime.'

useHead({ title: pageTitle })
</script>
