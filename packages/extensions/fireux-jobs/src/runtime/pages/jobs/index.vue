<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <JobCTA />
      <JobCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { computed } from 'vue'

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
})

useHead({ title: `${appName} | ${pageTitle}` })

const { appJobs } = useJobCollection()
const collection = computed(() => appJobs.value ?? [])
</script>

