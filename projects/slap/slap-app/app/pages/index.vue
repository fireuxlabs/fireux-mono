<template>
  <LandingIndex />
</template>

<script setup lang="ts">
import { appMeta } from '../meta'
import LandingIndex from '../components/Landing/Index.vue'

definePageMeta({ layout: 'landing', nav: { key: 'home', label: 'Home', icon: 'i-lucide-house', order: 0, desktop: true, mobile: true, layouts: ['landing'] } })
useSeoMeta({ title: appMeta.seoHome.title, description: appMeta.seoHome.description })
</script>
