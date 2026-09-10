<template>
  <AppPricingTier
    :app-name="appName"
    :contact-email="contactEmail"
    :tier-id="tierId"
    :tiers="tiers"
  />
</template>
<script setup lang="ts">

const { appName, contactEmail, tiers } = useFireuxPricing()
const route = useRoute()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route) =>
    ['free', 'professional', 'business', 'your-app', 'your-ecosystem'].includes(
      String(route.params.tier)
    ),
})
useSeoMeta({ title: () => `${tierId.value} pricing · FireUX` })
</script>
