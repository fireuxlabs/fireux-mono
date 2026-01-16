<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsObjectsJobCTA />
      <OrganismsObjectsJobCollectionManager :cards="cards" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useHead } from 'nuxt/app'
import { computed } from 'vue'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

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
const { card: makeCard } = useJobInterface()

const cards = computed(() =>
  (appJobs.value ?? [])
    .map((job) => makeCard(job))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

</script>

