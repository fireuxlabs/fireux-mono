<template>
  <AppPricingTier
    :app-name="appName"
    :contact-email="contactEmail"
    :tier-id="tierId"
    :tiers="tiers"
  />
</template>
<script setup lang="ts">
const { appName, contactEmail, tiers } = useMiseboxPricing()
const route = useRoute<'pricing-tier'>()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route) =>
    route.name === 'pricing-tier' &&
    ['free', 'pro', 'business'].includes(String(route.params.tier)),
})
useSeoMeta({
  title: () =>
    `${tiers.value.find((tier) => tier.id === tierId.value)?.title || 'Plan'} pricing · Misebox`,
})
</script>
