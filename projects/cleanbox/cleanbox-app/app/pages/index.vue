<template>
  <EffectsBubbles />
  <LandingHeroSection
    app-name="cleanbox"
    big-personality="Bring Bling"
    headline="to your operations"
    hero-primary-line="Cleanbox is the <strong>operating system</strong> for cleaning companies and crews. Coordinate schedules, quality checks, and billing from one <strong>streamlined console</strong>. Keep every service <strong>verified</strong>, recurring, and client-ready."
    primary-cta-label="Get started"
    secondary-cta-label="Browse crews"
    secondary-cta-to="/crews"
    console-bridge-line="The operating system for repeatable cleaning operations with <strong>proof</strong>, quality control, and billing discipline."
    :hero-bullets="heroBullets"
    :right-panel-items="rightPanelItems"
    right-panel-long-button-label="Get started"
    right-panel-long-button-to="/get-started"
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
  title: 'Cleanbox — Cleaning operations you can trust',
  description: 'Schedule, verify, and invoice every clean with confidence.',
})

const heroBullets = [
  'Smart scheduling and crew assignments',
  'QA checklists with photo proof',
  'Compliance and certification tracking',
  'Stripe-ready invoicing and exports',
]

const rightPanelItems = [
  {
    title: 'Scheduling',
    description: 'Plan crews and shifts across properties.',
    icon: 'i-lucide-calendar-check',
  },
  {
    title: 'QA proof',
    description: 'Photo receipts and sign-off updates.',
    icon: 'i-lucide-image',
  },
  {
    title: 'Billing',
    description: 'Invoice-ready service logs and exports.',
    icon: 'i-lucide-wallet',
  },
]
</script>
