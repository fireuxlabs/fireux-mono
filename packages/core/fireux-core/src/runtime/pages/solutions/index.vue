<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto max-w-5xl space-y-8">
        <LandingSolutions variant="hub" />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'solutions',
    label: 'Solutions',
    icon: 'i-lucide-lightbulb',
    order: 28,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      appRoles: ['global', 'standalone'],
    },
  },
})

useSeo({
  title: computed(() => `Solutions - ${appName.value}`),
  description: computed(() => `Practical solution pages for ${appName.value}.`),
  path: '/solutions',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
    }),
})
</script>
