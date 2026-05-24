<template>
  <PublicPartnerPricingPage />
</template>

<script setup lang="ts">
import { useEcosystemPricingPage } from 'fireux-core/runtime/composables/fireux/pricing/useEcosystemPricingPage'

const { ecosystemName } = useEcosystemPricingPage()

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: () => `Partner Pricing · ${ecosystemName.value}`,
  description: () => `Partner pricing for ${ecosystemName.value} partners bringing new businesses into the ecosystem.`,
})
</script>
