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
const publicTier = computed(() => String(route.params.tier || ''))
const tierId = computed(() => {
  const value = publicTier.value
  if (value === 'premium') return 'pro'
  if (value === 'business') return 'managed'
  return value
})
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) =>
    ['free', 'premium', 'business'].includes(String(route.params.tier)),
})
useSeoMeta({
  title: () =>
    `${publicTier.value.charAt(0).toUpperCase()}${publicTier.value.slice(1)} pricing · Misebox`,
})
</script>
