<template><LandingIndex /></template>
<script setup lang="ts">
import LandingIndex from '../components/Landing/Index.vue'
import { appMeta } from '../meta'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing', requiresAuth: false })
useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/home',
  logo: '/img/app/logo.png',
})
</script>
