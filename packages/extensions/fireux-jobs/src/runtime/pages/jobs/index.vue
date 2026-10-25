<template>
  <UPage>
    <JobHero />
    <UPageBody>
      <JobCreate />
      <FireState v-bind="page.state" />
      <JobCollection
        v-show="page.state.outcome === 'ready' || page.jobs.length > 0"
        :jobs="page.jobs"
      />
      <FireCollectionPagination
        v-if="page.pagination"
        v-bind="page.pagination"
        @load-more="page.loadMore"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useJobCollectionPage } from '../../job/composables/useJobCollectionPage'

definePageMeta({
  layout: 'default',
  title: 'Jobs',
  description:
    'Browse published opportunities before you join, see the named employer and workplace, and apply directly without an agency in between.',
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

const page = useJobCollectionPage()
</script>
