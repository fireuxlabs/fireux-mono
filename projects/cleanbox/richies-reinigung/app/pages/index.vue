<template>
  <MissingBrandAssetsFlag />
  <TenantPlaceholderFlag />
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
  title: 'Richies Reinigung — Tenant',
  description:
    'Richies Reinigung tenant child app for app setup, membership, and thin shared operations inside Cleanbox.',
})

const title = 'Richies Reinigung'
const accent = 'Cleanbox tenant runtime'
const paragraph =
  'A thin tenant child app for <span class="text-primary">app setup</span>, <span class="text-primary">team access</span>, and <span class="text-primary">shared Cleanbox runtime</span> without a bespoke tenant landing architecture.'

const badges = [
  { src: '/img/ecosystem/wordmark-light.svg', alt: 'Cleanbox' },
  { src: '/img/stack/firebase-white.png', alt: 'Firebase' },
]

const hero = {
  primary: { label: 'Open App', to: '/apps' },
  secondary: { label: 'View Team', to: '/users' },
}

const bullets = [
  { icon: 'i-lucide-app-window', text: 'Shared child-app shell' },
  { icon: 'i-lucide-shield-check', text: 'Auth and membership flow' },
  { icon: 'i-lucide-users', text: 'Tenant user overlays and access' },
  { icon: 'i-lucide-image-off', text: 'Placeholder branding until real assets arrive' },
]

const quickPeek = [
  {
    title: 'Tenant status',
    copy: 'Check app setup, placeholder branding, and runtime posture.',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'App',
    copy: 'Inspect the child app surface and shared overlays.',
    icon: 'i-lucide-app-window',
  },
  {
    title: 'Team',
    copy: 'Review users and access in this tenant.',
    icon: 'i-lucide-users',
  },
]

const footerBadge = 'Cleanbox · Firebase · Firestore'

const solutions = {
  title: 'Tenant Console',
  subtitle: 'Use the shared child-app surfaces before adding anything domain-specific.',
  items: [
    {
      title: 'Apps',
      description: 'Inspect tenant app settings and runtime state.',
      to: '/apps',
      cta: 'Open',
      icon: 'i-lucide-app-window',
    },
    {
      title: 'Users',
      description: 'Manage team members and role visibility.',
      to: '/users',
      cta: 'Browse',
      icon: 'i-lucide-users',
    },
  ],
}
</script>
