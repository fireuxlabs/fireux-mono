<template>
  <UPage>
    <UPageBody>
      <ProjectHero />
      <ProjectCreate />
      <ProjectCollection v-if="outcome === 'ready'" :projects="projects" />
      <FireStateCard
        v-else
        entity="projects"
        kind="collection"
        :loading="outcome === 'pending'"
        :state="outcome === 'error' ? 'error' : 'empty'"
      />
      <FireDiagnosticsDebugPanel
        title="Projects index acquisition"
        context="Canonical Projects passed into the FL index surface."
        object-origin="fetched"
        :objects="{ projects }"
        :derived="{ count: projects.length }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjects } from 'fireux-fireux/runtime/project/composables/useProjects'

const { projects, outcome } = useProjects()

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

useSeo({
  title: 'FireUX Projects',
  description: 'Browse FireUX Projects and the Apps connected to each one.',
  path: '/projects',
  image: '/img/app/cover.png',
})
</script>
