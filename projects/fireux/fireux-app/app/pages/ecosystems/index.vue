<template>
  <UPage>
    <UPageBody>
      <EcosystemHero />
      <MoleculesStateCard
        v-if="outcome === 'pending'"
        entity="ecosystems"
        kind="collection"
        loading
      />
      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="ecosystems"
        kind="collection"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'empty'"
        entity="ecosystems"
        kind="collection"
        state="empty"
      />
      <EcosystemCollection v-else :ecosystems="ecosystems" />
      <DevDebugPanel
        title="Ecosystems index acquisition"
        context="Canonical Ecosystems passed into the FL index surface."
        object-origin="fetched"
        :objects="{ ecosystems }"
        :derived="{ count: ecosystems.length }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const { ecosystems, outcome } = usePublishedPlatformEcosystemDirectory()

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
  imageHeight: 720,
  imageWidth: 1280,
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
