<template>
  <main class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10">
    <ProjectHero />
    <ProjectCollection :projects="projects" :apps="apps" />
  </main>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'

const { projects } = useProjects()
const { apps } = useApps('/api/platform/apps')

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
