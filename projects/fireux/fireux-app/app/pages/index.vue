<template>
  <FrameworkHome />
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { sourceMeta } from '../content/meta/source'

definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: { hidden: true },
})
useAppLandingSeo({
  title: sourceMeta.landing.seo.title,
  description: sourceMeta.landing.seo.description,
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
})
</script>
