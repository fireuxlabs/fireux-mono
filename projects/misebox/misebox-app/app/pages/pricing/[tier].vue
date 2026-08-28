<template>
  <AppPricingTier
    :app-name="appName"
    :contact-email="contactEmail"
    :tier-id="tierId"
    :tiers="tiers"
  />
</template>
<script setup lang="ts">
import type { RouteLocationNormalized } from 'vue-router'

const { appName, contactEmail, tiers } = useMiseboxPricing()
const route = useRoute()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) =>
    ['free', 'professional', 'business', 'managed', 'your-app'].includes(
      String(route.params.tier)
    ),
})
useSeoMeta({
  title: () =>
    `${tierId.value.charAt(0).toUpperCase()}${tierId.value.slice(1)} pricing · Misebox`,
})
</script>
