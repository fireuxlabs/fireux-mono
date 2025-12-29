<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Jobs" description="Browse jobs." />
    <UPageBody class="pagebody">
      <OrganismsObjectsJobCTA v-if="coreProfile" />
      <OrganismsObjectsJobSectionsAgentCollection v-if="coreProfile" />
      <OrganismsObjectsJobSectionsGlobalCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
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
