<template>
  <main class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10">
    <EcosystemHero />
    <EcosystemCollection
      :ecosystems="ecosystems"
      title="Active Ecosystems"
      description="Each Ecosystem groups Apps and belongs to one Project."
      link
      :show-variant-toggle="false"
    />
  </main>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const { ecosystems } = usePublishedPlatformEcosystemDirectory()

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
  description: 'Browse published FireUX Ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeo({
  title: 'FireUX Ecosystems',
  description: 'Browse published FireUX Ecosystems and their connected Apps.',
  path: '/ecosystems',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: ecosystems.value.map((ecosystem) => ({
        name: ecosystem.name,
        url: context.absoluteUrl(ecosystem.detail_url),
      })),
    }),
})
</script>
