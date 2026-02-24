<template>
  <LandingSolutions
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle = 'Ship faster with platform primitives built for modern Vue teams.'

const items = [
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
]
</script>
