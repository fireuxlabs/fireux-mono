<template><LandingPublic /></template>
<script setup lang="ts">
import LandingPublic from '../components/Landing/Public.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: 'Discover properties',
  description: 'Explore published properties across the Granite ecosystem.',
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
