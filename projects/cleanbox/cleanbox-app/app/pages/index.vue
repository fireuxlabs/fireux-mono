<template>
  <EffectsBubbles />
  <LandingHeroSection />

  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />
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

const solutions = {
  title: 'Get started',
  subtitle: 'Scheduling, QA, and billing tools built for cleaning teams.',
  items: [
    {
      title: 'Scheduling',
      description:
        'Smart rota planning and crew assignments across properties.',
      to: '/scheduling',
      cta: 'Plan jobs',
      icon: 'i-lucide-calendar-range',
    },
    {
      title: 'QA & Proof',
      description: 'Photo checklists, geo stamps, and client-ready updates.',
      to: '/qa',
      cta: 'Capture QA',
      icon: 'i-lucide-clipboard-check',
    },
    {
      title: 'Compliance',
      description: 'Training records, certifications, and incident tracking.',
      to: '/compliance',
      cta: 'Review',
      icon: 'i-lucide-badge-check',
    },
    {
      title: 'Billing',
      description: 'Hours, consumables, and Stripe-ready invoicing.',
      to: '/billing',
      cta: 'Invoice',
      icon: 'i-lucide-wallet-cards',
    },
    {
      title: 'Clients',
      description: 'Manage SLAs, site notes, and client portal access.',
      to: '/clients',
      cta: 'Manage',
      icon: 'i-lucide-building-2',
    },
    {
      title: 'Reports',
      description: 'KPIs, exports, and audit-ready summaries.',
      to: '/reports',
      cta: 'Export',
      icon: 'i-lucide-file-chart-column',
    },
  ],
}
</script>
