<template>
  <AppAssets />
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'

const fireux = useFireUXConfig()

definePageMeta({
  nav: {
    key: 'assets',
    label: 'Assets',
    icon: 'i-lucide-image',
    order: 30,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeoMeta({
  title: () => `Assets - ${fireux.appName || fireux.appShortName || 'App'}`,
  description: () =>
    `Artwork for ${fireux.appName || fireux.appShortName || 'this App'}.`,
  robots: 'noindex,follow',
})
</script>
