<template><LandingPublic /></template>
<script setup lang="ts">
import LandingPublic from '../components/Landing/Public.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: 'Find your next stay',
  description:
    'Explore places to stay and discover the properties behind BuenoHost.',
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
