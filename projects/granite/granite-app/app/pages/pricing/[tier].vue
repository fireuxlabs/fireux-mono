<template>
  <PricingTier
    :app-name="appName"
    :contact-email="contactEmail"
    :tier-id="tierId"
    :tiers="tiers"
  />
</template>
<script setup lang="ts">
import type { RouteLocationNormalized } from 'vue-router'

const { appName, contactEmail, tiers } = useGranitePricing()
const route = useRoute()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) =>
    ['free', 'pro', 'managed', 'your-app'].includes(String(route.params.tier)),
})
useSeoMeta({ title: () => `${tierId.value} pricing · Granite` })
</script>
