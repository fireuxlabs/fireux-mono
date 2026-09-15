<template>
  <main><LandingPublic /></main>
</template>

<script setup lang="ts">
import LandingPublic from '../components/Landing/Public.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: 'Find Kitchens and Explore Menus | Misebox',
  description:
    'Find your next place to eat. Explore Kitchens, browse their Menus and discover the food they serve.',
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
