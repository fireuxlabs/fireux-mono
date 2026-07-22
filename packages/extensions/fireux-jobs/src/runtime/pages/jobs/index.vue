<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: use the public-index shell with discovery before author actions. -->
<template>
  <PublicIndexSurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-briefcase-business"
    secondary-label="For employers and professionals"
  >
    <JobCollectionManager />

    <template #secondary>
      <JobCTA />
    </template>
  </PublicIndexSurface>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Jobs'
const pageDescription = 'Explore open roles from employers across the network.'

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description: 'Explore open roles from employers across the network.',
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
