<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <JobCTA />
      <JobCollectionManager :collection="appJobs" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useHead } from 'nuxt/app'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'

const { appName } = useFireUXConfig()

const pageTitle = 'Jobs'
const pageDescription = 'Browse jobs.'

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

useHead({ title: `${appName} | ${pageTitle}` })

const { appJobs } = useJobCollection()
</script>

