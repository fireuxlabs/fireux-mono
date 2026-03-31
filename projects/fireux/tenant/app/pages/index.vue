<!-- FILE: projects/fireux/tenant/app/pages/index.vue -->
<template>
  <MissingBrandAssetsFlag />
  <TenantPlaceholderFlag />

  <!-- Background effect -->
  <EffectsStars />

  <!-- Hero row -->
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

  <!-- Minimal tenant actions -->
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />

  <!-- Lightweight sections that don’t require tenant-specific objects -->
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
  title: 'FireUX Tenant — Sandbox',
  description:
    'A minimal tenant sandbox to test authentication, app initialization, and user membership in FireUX.',
})

const title = 'Tenant Sandbox'
const accent = 'FireUX Runtime'
const paragraph =
  'A super-lean tenant for validating <span class="text-primary">auth</span>, <span class="text-primary">app init</span>, and <span class="text-primary">membership</span> — without extra domain objects.'

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
  { icon: 'i-lucide-users', text: 'Tenant user overlays & roles' },
  { icon: 'i-lucide-bolt', text: 'Zero extra objects by default' },
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
    title: 'No objects',
    copy: 'Keep it lean; add Notes later if needed.',
    icon: 'i-lucide-minimize-2',
  },
]

const footerBadge = 'Nuxt · Firebase · Firestore'

const solutions = {
  title: 'Tenant Console',
  subtitle: 'Start with just the essentials.',
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
    // Optional: enable later when you add a tiny CRUD object
    // {
    //   title: 'Notes',
    //   description: 'Add a minimal object for CRUD testing.',
    //   to: '/notes',
    //   cta: 'Try',
    //   icon: 'i-lucide-notebook-text',
    // },
  ],
}
</script>
