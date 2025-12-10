<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Jobs" description="Browse jobs." />
    <UPageBody class="pagebody">
      <!-- CTA only when agent profile exists -->
      <OrganismsJobsCTA v-if="coreProfile" />
      <!-- Jobs managed by this agent (local to the current agent) -->
      <OrganismsJobsSectionsAgentCollection v-if="coreProfile" />
      <!-- Global jobs resolved for this runtime (ecosystem-wide) -->
      <OrganismsJobsSectionsGlobalCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'

const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description: 'Browse jobs.',
  nav: {
    key: 'jobs',
    label: 'Jobs',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'JobsIndexPage',
  head: { title: 'Jobs' },
})

useHead({ title: `${appName} | Jobs` })

const { coreProfile } = useAgent()
</script>
