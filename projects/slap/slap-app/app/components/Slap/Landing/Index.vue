<template>
  <LandingEcosystemHome
    :content="content"
    hero-image="/img/landing/brand-commerce-hero-v1.png"
    hero-alt="A small brand team preparing products and storefront content"
    hero-position="58% center"
    rail-label="Commerce operations"
    :rail-items="railItems"
    :section-dwell="false"
    :surface-items="surfaceItems"
  />
</template>

<script setup lang="ts">
import { content, railItems, surfaceItems } from './landing-content'
</script>
