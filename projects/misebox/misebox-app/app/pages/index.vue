<template>
  <main><LandingPublic /></main>
</template>

<script setup lang="ts">
import LandingPublic from '../components/Landing/Public.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: 'Kitchens and Menus | Misebox',
  description: 'Find a Kitchen and view its Menus.',
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
