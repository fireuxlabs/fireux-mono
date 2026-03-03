<template>
  <EffectsStars />
  <LandingHeroSection
    app-name="fireux"
    big-personality="Ignite With"
    headline="Powerful Applications"
    hero-primary-line="FireUX is the <strong>console architecture</strong> for builders and operators. A low-code ecosystem for <strong>responsive</strong>, <strong>scalable</strong>, and <strong>data-driven</strong> applications built upon <strong>Nuxt 4</strong> and <strong>Firebase</strong>."
    primary-cta-label="Get started"
    secondary-cta-label="Browse projects"
    secondary-cta-to="/projects"
    console-bridge-line="The operating system for building and running domain applications from one shared, <strong>extensible core</strong>."
    :hero-bullets="heroBullets"
    :right-panel-items="rightPanelItems"
  >
    <template #get-started>
      <LandingGetStarted />
    </template>

    <template #apps>
      <LandingApps />
    </template>

    <template #after-products>
      <LandingFuel />
      <LandingFeatures first />
      <LandingSkillsIcons />
      <LandingEcosystems />
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
  title: 'FireUX — Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
})

const heroBullets = [
  'Nuxt 4 + Firebase orchestration out of the box',
  'Reusable design system and shared components',
  'Tenant-aware and white-label runtime',
  'Automations, PWA, and CI presets',
]

const rightPanelItems = [
  {
    title: 'Modules',
    description: 'Wire Nuxt + Firebase with ready composables.',
    icon: 'i-lucide-puzzle',
  },
  {
    title: 'Tenant theming',
    description: 'White-label overrides from one config.',
    icon: 'i-lucide-palette',
  },
  {
    title: 'Automation',
    description: 'PWA, CI presets, and deploy pipelines.',
    icon: 'i-lucide-rocket',
  },
]
</script>
