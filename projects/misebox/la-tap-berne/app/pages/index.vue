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
  title: 'La Tap Berne — Tenant',
  description:
    'La Tap Berne tenant workspace for operations, app initialization, and team access in the Misebox ecosystem.',
})

const title = 'La Tap Berne'
const accent = 'Misebox Tenant Runtime'
const paragraph =
  'A focused tenant for managing <span class="text-primary">operations</span>, <span class="text-primary">team access</span>, and <span class="text-primary">app setup</span> inside Misebox.'

const badges = [
  { src: '/img/ecosystem/wordmark-light.svg', alt: 'Misebox' },
  { src: '/img/stack/firebase-white.png', alt: 'Firebase' },
]

const hero = {
  primary: { label: 'Open App Console', to: '/apps' },
  secondary: { label: 'View Team', to: '/users' },
}

const bullets = [
  { icon: 'i-lucide-utensils-crossed', text: 'Restaurant-ready tenant shell' },
  { icon: 'i-lucide-shield-check', text: 'Auth and membership flow' },
  { icon: 'i-lucide-app-window', text: 'Runtime app initialization' },
  { icon: 'i-lucide-bolt', text: 'Lean setup, extension-ready' },
]

const quickPeek = [
  {
    title: 'Tenant status',
    copy: 'Verify runtime, auth, and role wiring.',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'Apps',
    copy: 'Inspect available app surfaces and metadata.',
    icon: 'i-lucide-app-window',
  },
  {
    title: 'Team',
    copy: 'Review users and access in this tenant.',
    icon: 'i-lucide-users',
  },
]

const footerBadge = 'Misebox · Firebase · Firestore'

const solutions = {
  title: 'Tenant Console',
  subtitle: 'Start from core operations, then layer domain modules.',
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
