<template>
  <main><LandingPublic /></main>
</template>

<script setup lang="ts">
import LandingPublic from '../components/Landing/Public.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: 'Explore Apps and Ideas | FireUX',
  description:
    'Explore Apps, discover ideas and find a starting point for your own Project on FireUX.',
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
