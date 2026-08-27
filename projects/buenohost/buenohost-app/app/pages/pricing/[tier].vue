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
import { useBuenoHostPricing } from '../../composables/useBuenoHostPricing'

const { appName, contactEmail, tiers } = useBuenoHostPricing()
const route = useRoute()
const tierId = computed(() => String(route.params.tier || ''))
definePageMeta({
  layout: 'landing',
  validate: (route: RouteLocationNormalized) =>
    ['free', 'pro', 'managed', 'your-app'].includes(String(route.params.tier)),
})
useSeoMeta({ title: () => `${tierId.value} pricing · BuenoHost` })
</script>
