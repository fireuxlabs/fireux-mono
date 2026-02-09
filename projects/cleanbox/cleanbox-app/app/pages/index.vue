<template>
  <!-- Background effect (Cleanbox) -->
  <EffectsBubbles />

  <div>
    <LandingShell>
      <template #left>
        <LandingHero
          :title="hero.title"
          :accent="hero.accent"
          :paragraph="hero.paragraph"
          :badges="hero.badges"
          :primary="hero.primary"
          :secondary="hero.secondary"
          :tertiary="hero.tertiary"
          :bullets="hero.bullets"
        />
      </template>

      <template #right>
        <LandingQuickPeek
          :title="quickPeek.title"
          :subtitle="quickPeek.subtitle"
          :cta="quickPeek.cta"
          :items="quickPeek.items"
          :footer="quickPeek.footer"
        />
      </template>
    </LandingShell>

    <LandingSolutions
      :title="solutions.title"
      :subtitle="solutions.subtitle"
      :items="solutions.items"
    />
  </div>
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

const hero = {
  title: 'Bring your bling',
  accent: 'to your operations',
  paragraph:
    'Coordinate crews, quality checks, and billing from one dashboard. Cleanbox keeps every service <span class="text-primary">scheduled</span>, <span class="text-primary">verified</span>, and <span class="text-primary">client-ready</span>.',
  badges: [
    { src: '/img/app/wordmark-light.png', alt: 'Cleanbox wordmark' },
    { src: '/img/app/logo.png', alt: 'Cleanbox emblem' },
  ],
  primary: { label: 'Get Started', to: '/get-started' },
  secondary: { label: 'Explore Crews', to: '/crews' },
  tertiary: undefined,
  bullets: [
    {
      icon: 'i-lucide-calendar-range',
      text: 'Smart scheduling &amp; crew assignments',
    },
    {
      icon: 'i-lucide-clipboard-check',
      text: 'QA checklists with photo proof',
    },
    {
      icon: 'i-lucide-badge-check',
      text: 'Compliance &amp; certification tracking',
    },
    {
      icon: 'i-lucide-wallet-cards',
      text: 'Stripe-ready invoicing &amp; exports',
    },
  ],
}

const quickPeek = {
  title: 'Ops at a Glance',
  subtitle: 'Dispatch, QA, and billing updates for crews across properties',
  cta: {
    label: 'Explore the Dashboard',
    to: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
  },
  items: [
    {
      icon: 'i-lucide-calendar-check',
      title: 'Real-Time Scheduling',
      subtitle: 'Crew and clean teams see updates instantly',
      description:
        'Assign shifts, sync routes, and handle fill-ins from a single board. Cleanbox watches workloads and alerts you to coverage gaps.',
    },
    {
      icon: 'i-lucide-image',
      title: 'QA with Photo Receipts',
      subtitle: 'Automate sign-offs and client updates',
      description:
        'Every job checks in with location-tagged photos and notes. Ready to share with clients, managers, and compliance reviewers.',
    },
    {
      icon: 'i-lucide-wallet',
      title: 'Billing That Syncs',
      subtitle: 'Ready for Stripe, ACH, and 30-day payments',
      description:
        'Generate invoices from service logs and auto-attach QA proof. Export to accounting or use FireUX as your hub for payouts.',
    },
    {
      icon: 'i-lucide-users-2',
      title: 'Crew Experience',
      subtitle: 'Keep top crews booked and motivated',
      description:
        'Give crew leads direct access to schedules, QA feedback, and earnings. Stop juggling text threads and spreadsheets.',
    },
  ],
  footer: {
    title: 'Need rollout support?',
    subtitle: 'Our team helps onboard markets and sync your tooling in weeks.',
    cta: { label: 'Talk to Sales', to: '/sales', icon: 'i-lucide-headset' },
  },
}

const solutions = {
  title: 'Solutions',
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
