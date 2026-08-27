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

const { appName, contactEmail, tiers } = useMiseboxPricing()
const route = useRoute()
const tierId = computed(() => {
  const value = String(route.params.tier || '')
  if (value === 'premium') return 'pro'
  if (value === 'business') return 'managed'
  return value
})
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) =>
    ['free', 'premium', 'business', 'your-app'].includes(
      String(route.params.tier)
    ),
})
useSeoMeta({ title: () => `${tierId.value} pricing · Misebox` })
</script>
