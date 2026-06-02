<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Browse FireUX projects that can be managed in this app."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        family="console"
        cta="Create or open a project console to organise apps, ecosystems, and operator access."
      />

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
