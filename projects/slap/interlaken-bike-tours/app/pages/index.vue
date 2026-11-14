<template>
  <LandingHome />
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { pageSeo } from '~/content/seo'

definePageMeta({
  layout: 'default',
})

const page = pageSeo('/')

useAppLandingSeo({
  title: page.title,
  description: page.description,
  path: '/',
  image: '/img/app/thumbnail.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
