<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: use the public-index shell with discovery before author actions. -->
<template>
  <PublicIndexSurface
    eyebrow="Open jobs, direct hiring"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-briefcase-business"
  >
    <template #background>
      <JobIndexArtwork />
    </template>

    <template #actions>
      <UButton
        to="/jobs#open-jobs"
        label="Browse open jobs"
        icon="i-lucide-search"
        size="lg"
      />
      <UButton
        to="/jobs/manage"
        label="Post a job"
        icon="i-lucide-circle-plus"
        color="neutral"
        variant="soft"
        size="lg"
      />
    </template>

    <template #hero>
      <JobIndexPromise />
    </template>

    <JobCollectionManager />

    <template #secondary>
      <JobCTA />
    </template>
  </PublicIndexSurface>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const { appName } = useFireUXConfig()

const pageTitle = 'Jobs'
const pageDescription =
  'Browse published opportunities before you join, see the named employer and workplace, and apply directly without an agency in between.'

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description: pageDescription,
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

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/jobs',
})
</script>
