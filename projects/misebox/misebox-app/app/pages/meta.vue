<template>
  <UPage>
    <UPageHeader
      title="Public metadata"
      description="The copy, search defaults and legal notices published by Misebox."
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
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  robots: 'noindex,follow',
  sitemap: false,
  nav: {
    key: 'meta',
    label: 'Metadata',
    icon: 'i-lucide-file-json',
    order: 85,
    position: 'bottom',
    desktop: true,
    mobile: true,
    menus: ['default', 'landing'],
  },
})

useSeo({
  title: 'Public metadata · Misebox',
  description:
    "Read Misebox's public copy, search and social metadata, and App-specific legal information.",
  path: '/meta',
  image: '/img/app/cover.png',
  robots: 'noindex,follow',
})
</script>
