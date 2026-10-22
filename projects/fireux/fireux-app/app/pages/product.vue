<template>
  <Landing />
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

definePageMeta({
  layout: 'framework',
  requiresAuth: false,
})

useAppLandingSeo({
  title: appMeta.seoProduct.title,
  description: appMeta.seoProduct.description,
  path: '/product',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
})
</script>
