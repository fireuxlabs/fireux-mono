<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Ecosystem Operation: publish the practical build roadmap. -->
<template>
  <OperationRoadmapPage
    title="Ecosystem"
    description="Review the selected Project Ecosystem and the Apps inside it."
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
  { label: 'View the ecosystem connected to your project', done: true },
  { label: 'Create or connect an ecosystem', done: false },
  { label: 'Manage ecosystem identity and branding', done: false },
  { label: 'Manage which apps belong to the ecosystem', done: false },
  { label: 'Manage shared capabilities', done: false },
  { label: 'Review ecosystem activity', done: false },
] as const

const action = {
  label: 'Open Ecosystem',
  to: '/console/project/ecosystem',
  icon: 'i-lucide-orbit',
} as const

useSeo({
  title: 'Manage your project ecosystem - FireUX',
  description:
    'Review the selected FireUX Project Ecosystem and the Apps inside it.',
  path: '/operations/ecosystem',
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
