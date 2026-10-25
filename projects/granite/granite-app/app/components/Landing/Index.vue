<template>
  <FireLandingEcosystemHome
    :content="content"
    hero-image="/img/landing/property-operations-hero-v1.png"
    hero-alt="A property manager and building professional reviewing an inspection"
    hero-position="62% center"
    rail-label="Portfolio operations"
    :rail-items="railItems"
    :pricing-plans="landingTiers"
    :surface-items="surfaceItems"
  />
</template>

<script setup lang="ts">
import { content, railItems, surfaceItems } from './landing-content'

const { landingTiers } = useGranitePricing()
</script>
