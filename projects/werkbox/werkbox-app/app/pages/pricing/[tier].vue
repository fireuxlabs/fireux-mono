<template><PublicProductPricingTier :tier-id="tierId" /></template>
<script setup lang="ts">
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) => ['free', 'pro', 'managed', 'your-app'].includes(String(route.params.tier)),
})
useSeoMeta({ title: () => `${tierId.value} pricing · Werkbox` })
</script>
