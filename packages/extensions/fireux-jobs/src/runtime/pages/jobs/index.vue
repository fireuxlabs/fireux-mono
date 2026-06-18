<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <JobCTA />
      <JobCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Jobs'
const pageDescription = 'Browse open roles and post opportunities.'

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description: 'Browse open roles and post opportunities.',
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
