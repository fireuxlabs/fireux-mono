<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Apps Operation: publish the practical build roadmap. -->
<template>
  <OperationRoadmapPage
    title="Apps"
    description="Review the Apps connected to the selected Project."
    :items="roadmap"
    :action="action"
  />
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const roadmap = [
  { label: 'View apps connected to your project', done: true },
  { label: 'Add a new app', done: false },
  { label: "Manage each app's identity and branding", done: false },
  { label: 'Connect domains', done: false },
  { label: 'See hosting and deployment status', done: false },
  { label: "Open each app's console", done: false },
] as const

const action = {
  label: 'Open Apps',
  to: '/console/project/apps',
  icon: 'i-lucide-app-window',
} as const

useSeo({
  title: 'Manage your project apps - FireUX',
  description: 'Review the Apps connected to the selected FireUX Project.',
  path: '/operations/apps',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})
</script>
