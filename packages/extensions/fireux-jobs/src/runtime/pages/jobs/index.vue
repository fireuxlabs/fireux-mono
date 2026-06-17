<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <JobCTA />
      <ClientOnly>
        <JobCollectionManager />
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Jobs'
const pageDescription = 'Canonical job index for the current runtime.'

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description: 'Canonical job index for the current runtime.',
  tag: 'jobs',
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
})

useHead({ title: `${appName} | ${pageTitle}` })

</script>
