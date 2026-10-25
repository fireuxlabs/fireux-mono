<template>
  <UPage>
    <ProjectHero />
    <UPageBody>
      <ProjectCreate />
      <FireState v-bind="page.state" />
      <ProjectCollection
        v-if="page.state.outcome === 'ready'"
        :projects="page.projects"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useProjectCollectionPage } from 'fireux-fireux/runtime/project/composables/useProjectCollectionPage'

definePageMeta({
  tag: 'projects',
  nav: {
    key: 'projects',
    label: 'Projects',
    icon: 'i-lucide-briefcase-business',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Projects',
  description: 'Browse active FireUX Projects.',
  layout: 'default',
  name: 'FireuxProjectsIndexPage',
})

const page = useProjectCollectionPage()
</script>
