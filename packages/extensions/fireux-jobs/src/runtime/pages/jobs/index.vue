<template>
  <UPage>
    <UPageBody>
      <JobHero />
      <JobCreate />
      <JobCollection :jobs="jobs" />
      <CollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useJobDirectory } from '../../job/composables/useJobDirectory'

const { appName } = useFireUXConfig()
const { jobs, hasMore, loadingMore, loadMore } = useJobDirectory()

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
