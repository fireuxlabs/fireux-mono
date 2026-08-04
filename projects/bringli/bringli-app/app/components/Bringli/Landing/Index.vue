<template>
  <LandingEcosystemHome
    :content="content"
    hero-image="/img/landing/supply-operations-hero-v1.png"
    hero-alt="A local producer and delivery coordinator preparing a supply handoff"
    hero-position="55% center"
    rail-label="Supply operations"
    :rail-items="railItems"
    :pricing-plans="landingTiers"
    :surface-items="surfaceItems"
  />
</template>

<script setup lang="ts">
import { content, railItems, surfaceItems } from './landing-content'

const { landingTiers } = useBringliPricing()
</script>
