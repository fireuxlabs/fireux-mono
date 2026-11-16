<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Public metadata"
        description="The copy, search defaults and legal notices published by FireUX."
        :links="[
          {
            label: 'Read JSON',
            to: '/api/app/meta',
            icon: 'i-lucide-braces',
            color: 'neutral',
            variant: 'outline',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        ]"
      />
      <UPageBody>
        <FireMeta />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  robots: 'noindex,follow',
  sitemap: false,
  nav: { hidden: true },
})

useSeo({
  title: 'Public metadata · FireUX',
  description:
    "Read FireUX's public copy, search and social metadata, and App-specific legal information.",
  path: '/meta',
  image: '/img/app/cover.png',
  robots: 'noindex,follow',
})
</script>
