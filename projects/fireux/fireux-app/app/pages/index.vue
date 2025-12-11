<template>
  <!-- Background effect (FireUX) -->
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

  <!-- Core solutions grid -->
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />

  <!-- Sections to ship now -->
  <LandingProducts :items="products" />
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
  title: 'FireUX — Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
})

const title = 'Ignite With'
const accent = 'Powerful Applications'
const paragraph =
  'A low-code ecosystem for responsive, scalable, and data-driven applications built upon <span class="text-primary">Nuxt4</span> &amp; <span class="text-primary">Firebase</span>.'

const badges = [
  { src: '/img/app/stack/nuxt-white.png', alt: 'Nuxt' },
  { src: '/img/app/stack/firebase-white.png', alt: 'Firebase' },
]

const hero = {
  primary: { label: 'Get Started', to: '/get-started' },
  secondary: { label: 'Explore Projects', to: '/projects' },
}

const bullets = [
  {
    icon: 'i-lucide-cable',
    text: 'Nuxt 4 + Firebase orchestration out of the box',
  },
  {
    icon: 'i-lucide-layout-dashboard',
    text: 'Reusable design system &amp; shared components',
  },
  { icon: 'i-lucide-layers-2', text: 'Tenant-aware &amp; white-label runtime' },
  { icon: 'i-lucide-zap', text: 'Automations, PWA, and CI presets' },
]

const quickPeek = [
  {
    title: 'Modules',
    copy: 'Wire Nuxt + Firebase with ready composables.',
    icon: 'i-lucide-puzzle',
  },
  {
    title: 'Tenant theming',
    copy: 'White-label overrides with a single config.',
    icon: 'i-lucide-palette',
  },
  {
    title: 'CI ready',
    copy: 'PWA, CI presets and deploy pipelines.',
    icon: 'i-lucide-rocket',
  },
]

const footerBadge = 'Nuxt · Firebase · Stripe'

const solutions = {
  title: 'Solutions',
  subtitle: 'Ship faster with platform primitives built for modern Vue teams.',
  items: [
    {
      title: 'Products',
      description: 'Hosted tools ready to deploy without provisioning.',
      to: '/products',
      cta: 'Explore',
      icon: 'i-lucide-package',
    },
    {
      title: 'White-label',
      description: 'Rebrand FireUX apps with tenant-aware theming.',
      to: '/whitelabel',
      cta: 'Partner',
      icon: 'i-lucide-badge-check',
    },
    {
      title: 'SaaS',
      description: 'Managed subscriptions with billing and auth baked in.',
      to: '/saas',
      cta: 'See plans',
      icon: 'i-lucide-zap',
    },
    {
      title: 'Templates',
      description: 'Starter kits for founders and internal tooling teams.',
      to: '/templates',
      cta: 'Browse',
      icon: 'i-lucide-layers-2',
    },
    {
      title: 'API-first',
      description: 'Composable endpoints to extend existing stacks.',
      to: '/api',
      cta: 'Docs',
      icon: 'i-lucide-code-xml',
    },
    {
      title: 'Automation',
      description: 'No-code workflows, webhooks, and scheduled jobs.',
      to: '/automation',
      cta: 'Set up',
      icon: 'i-lucide-bot',
    },
  ],
}

const products = [
  {
    title: 'Cleanbox',
    description: 'Scheduling, QA, billing for crews.',
    to: '/cleanbox',
    logo: '/img/app/logo.png',
    tag: 'Ops',
    tagColor: 'sky',
  },
  {
    title: 'Misebox',
    description: 'Recipes, inventory, suppliers.',
    to: '/misebox',
    logo: '/img/app/logo.png',
    tag: 'Kitchen',
    tagColor: 'violet',
  },
  {
    title: 'FireUX',
    description: 'Nuxt + Firebase + Stripe core.',
    to: '/core',
    logo: '/img/app/logo.png',
    tag: 'Core',
    tagColor: 'primary',
  },
]
</script>
