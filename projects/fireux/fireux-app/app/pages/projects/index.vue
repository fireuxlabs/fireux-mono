<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Browse FireUX projects that can be managed in this app."
    />

    <UPageBody>
      <!-- Console CTA family: actions live in ProjectCTA; browse lives in ProjectCollectionManager. -->
      <ProjectCTA />

      <ProjectCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'projects',
  nav: {
    key: 'projects',
    label: 'Projects',
    icon: 'i-lucide-folders',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  layout: 'default',
  name: 'ProjectsIndexPage',
  title: 'Projects',
  description: 'Browse projects.',
})

const pageTitle = 'Projects'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
