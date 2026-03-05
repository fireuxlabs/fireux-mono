<template>
  <EffectsLandingEffect />
  <LandingHeroSection
    :app-name="appMeta.brand.appName"
    :big-personality="appMeta.brand.bigPersonality"
    :headline="appMeta.brand.headline"
    :hero-primary-line="appMeta.heroPrimaryHtml"
    :primary-cta-label="appMeta.landingPrimaryCtaLabel"
    :secondary-cta-label="appMeta.landingSecondaryCtaLabel"
    :secondary-cta-to="appMeta.landingSecondaryCtaTo"
    :console-bridge-line="appMeta.consoleBridgeHtml"
    :hero-bullets="appMeta.heroBullets"
    :right-panel-items="appMeta.heroPanelItems"
  >
    <template #get-started>
      <LandingGetStarted />
    </template>

    <template #apps>
      <LandingApps />
    </template>

  </LandingHeroSection>
</template>

<script setup lang="ts">
import { appMeta } from '../content/meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>
