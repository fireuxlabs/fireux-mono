<template>
  <LandingProductPricingStrip :app-name="appName" :plans="landingTiers" />
</template>

<script setup lang="ts">
const { appName, landingTiers } = useMiseboxPricing()
</script>
