<template>
  <AppPricingTier
    :app-name="appName"
    :contact-email="contactEmail"
    :tier-id="tierId"
    :tiers="tiers"
  />
</template>
<script setup lang="ts">
const { appName, contactEmail, tiers } = useGranitePricing()
const route = useRoute<'pricing-tier'>()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route) =>
    route.name === 'pricing-tier' &&
    ['free', 'professional', 'business', 'managed', 'your-app'].includes(
      String(route.params.tier)
    ),
})
useSeoMeta({ title: () => `${tierId.value} pricing · Granite` })
</script>
