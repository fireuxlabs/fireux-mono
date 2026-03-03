<template>
  <EffectsLandingEffect />
  <LandingHeroSection
    app-name="bringli"
    big-personality="Local Producers,"
    headline="Delivered"
    hero-primary-line="Bringli is the <strong>operating system</strong> for producers and customers. Connect local producers, suppliers, and households in one <strong>simple order and drop flow</strong> powered by <strong>Drop</strong>."
    primary-cta-label="Get started"
    secondary-cta-label="Browse producers"
    secondary-cta-to="/suppliers"
    console-bridge-line="The operating system for local supply and <strong>delivery execution</strong> from one connected console."
    :hero-bullets="heroBullets"
    :right-panel-items="rightPanelItems"
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
  title: 'Bringli | Local producer delivery',
  description:
    'Bringli is a local delivery marketplace for homes and businesses, starting with supplier operations powered by Drop.',
})

const heroBullets = [
  'Fresh local producers and suppliers in one directory',
  'Home and business dropoff flows built for reliability',
  'Supplier onboarding and profile management through Drop',
  'Launched in Interlaken with market-by-market expansion',
]

const rightPanelItems = [
  {
    title: 'Supplier management',
    description: 'Profiles, readiness, and contact details.',
    icon: 'i-lucide-users',
  },
  {
    title: 'Dropoff readiness',
    description: 'Delivery area and service-level capability.',
    icon: 'i-lucide-package-check',
  },
  {
    title: 'Operational confidence',
    description: 'Tighter first pipe before order expansion.',
    icon: 'i-lucide-shield-check',
  },
]
</script>
