<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update ecosystem discovery copy. -->
<template>
  <DirectorySurface
    eyebrow="Discover"
    title="Ecosystems"
    description="Explore the product families built with FireUX and the Apps each one groups."
    icon="i-lucide-orbit"
  >
    <template #actions>
      <UButton
        to="/apps"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse all Apps
      </UButton>
    </template>

    <template #hero>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <UBadge color="neutral" variant="soft" size="lg">
          {{ ecosystemCountLabel }}
        </UBadge>
        <UBadge color="neutral" variant="soft" size="lg">
          {{ appCountLabel(totalAppCount) }} in Ecosystems
        </UBadge>
      </div>
    </template>

    <EcosystemCollectionManager
      :controller="ecosystemsController"
      title="Active Ecosystems"
      description="Open an Ecosystem to explore its identity and connected Apps."
      link
    />
  </DirectorySurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const ecosystemsController = usePublishedPlatformEcosystemDirectory()
const ecosystems = ecosystemsController.ecosystems
const totalAppCount = computed(() =>
  ecosystems.value.reduce((total, ecosystem) => total + ecosystem.app_count, 0)
)
const ecosystemCountLabel = computed(
  () =>
    `${ecosystemsController.count.value} ${ecosystemsController.count.value === 1 ? 'Ecosystem' : 'Ecosystems'}`
)
const appCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'App' : 'Apps'}`

definePageMeta({
  tag: 'ecosystems',
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Ecosystems',
  description: 'Browse published FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeo({
  title: 'FireUX Ecosystems',
  description: 'Browse published FireUX ecosystems and their connected Apps.',
  path: '/ecosystems',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: ecosystemsController.ecosystems.value.map((ecosystem) => ({
        name: ecosystem.name,
        url: context.absoluteUrl(ecosystem.detail_url),
      })),
    }),
})
</script>
