<template>
  <LandingMissingBrandAssetsFlag />
  <LandingTenantPlaceholderFlag />
  <EffectsStars />
  <LandingShell>
    <template #left>
      <LandingHero
        :title="title"
        :accent="accent"
        :paragraph="paragraph"
        :badges="badges"
        :primary="hero.primary"
        :secondary="hero.secondary"
        :bullets="bullets"
      />
    </template>
    <template #right>
      <LandingQuickPeek :items="quickPeek" :footer-badge="footerBadge" />
    </template>
  </LandingShell>
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />
  <LandingFuel />
  <LandingFeatures first />
  <LandingSkillsIcons />
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
  title: 'FireUX Tenant',
  description:
    'Thin FireUX tenant child app for runtime setup, onboarding, and member access.',
})

const title = 'FireUX Tenant'
const accent = 'Thin child-app runtime'
const paragraph =
  'A minimal child app for validating <span class="text-primary">auth</span>, <span class="text-primary">app setup</span>, and <span class="text-primary">membership</span> inside FireUX without tenant-local architecture drift.'

const badges = [
  { src: '/img/stack/nuxt-white.png', alt: 'Nuxt' },
  { src: '/img/stack/firebase-white.png', alt: 'Firebase' },
]

const hero = {
  primary: { label: 'Open App Console', to: '/apps' },
  secondary: { label: 'View Members', to: '/users' },
}

const bullets = [
  { icon: 'i-lucide-shield-check', text: 'Auth + profile ensure flow' },
  { icon: 'i-lucide-app-window', text: 'Runtime app initialization' },
  { icon: 'i-lucide-users', text: 'Shared tenant membership overlays' },
  { icon: 'i-lucide-bolt', text: 'No tenant-local domain surfaces by default' },
]

const quickPeek = [
  {
    title: 'App status',
    copy: 'Check initialization and admin role state.',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'Members',
    copy: 'Inspect users resolved for this tenant.',
    icon: 'i-lucide-users',
  },
  {
    title: 'Thin by default',
    copy: 'Start with shell, onboarding, and membership before adding anything else.',
    icon: 'i-lucide-minimize-2',
  },
]

const footerBadge = 'Nuxt · Firebase · Firestore'

const solutions = {
  title: 'Tenant Console',
  subtitle: 'Keep the child app lean and shared-first.',
  items: [
    {
      title: 'App',
      description: 'Inspect the current tenant app and overlays.',
      to: '/apps',
      cta: 'Open',
      icon: 'i-lucide-app-window',
    },
    {
      title: 'Users',
      description: 'Browse members and roles resolved to this tenant.',
      to: '/users',
      cta: 'Browse',
      icon: 'i-lucide-users',
    },
  ],
}
</script>
