<!-- Concurrent edit — 2026-07-23 12:13 CEST — Adapt FireUX product truth to the shared Core landing surface. -->
<template>
  <LandingProductIndex
    :content="content"
    hero-layout="proof-wide"
    hero-mode="full"
  >
    <template #hero-preview>
      <FireUXLandingPreview :operations="operations" />
    </template>

    <template #after-hero>
      <LandingEcosystems />
    </template>
  </LandingProductIndex>
</template>

<script setup lang="ts">
import type { LandingProductIndexContent } from 'fireux-core/types/landing-product'
import { metaContent } from '../../../meta'
import FireUXLandingPreview from './Preview.vue'

const operations = (metaContent.operations ?? []).map(operation => ({
  id: operation.id,
  title: operation.title,
  description: operation.description,
  icon: operation.icon,
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
}))

const content = {
  hero: {
    badge: '$150 setup · $15/month',
    kicker: 'Ignite your idea.',
    title: 'Your business.',
    accent: 'Your app.',
    description:
      'We configure and launch a branded web app around one useful job. You get an installable PWA, accounts, an operator console, hosting, updates, and maintenance.',
    primaryAction: {
      label: 'Request Ignition',
      to: '/get-started#ignition-request',
      icon: 'i-lucide-rocket',
    },
    secondaryAction: {
      label: 'See price and scope',
      to: '/get-started',
      icon: 'i-lucide-receipt-text',
    },
    quietAction: {
      label: 'Browse FireUX apps',
      to: '/apps',
    },
    trustItems: [
      'One job for the app to do',
      'Your brand, accounts, and console',
      'Hosting and maintenance included',
    ],
  },
  operatingLoop: [
    {
      title: 'Decide',
      copy: 'Name the first job',
      icon: 'i-lucide-crosshair',
      to: '/get-started',
    },
    {
      title: 'Request',
      copy: 'Send an Ignition',
      icon: 'i-lucide-send',
      to: '/get-started#ignition-request',
    },
    {
      title: 'Launch',
      copy: 'Brand, app, console',
      icon: 'i-lucide-rocket',
      to: '/operations/ignition',
    },
    {
      title: 'Run',
      copy: 'Hosting and updates',
      icon: 'i-lucide-gauge',
      to: '/operations',
    },
  ],
  system: {
    eyebrow: 'What you get',
    title: 'Your app. Your console. We keep it running.',
    description:
      'One useful app for customers or staff, one console for the people running it, and FireUX behind both.',
    areas: [
      {
        eyebrow: 'For the people you serve',
        title: 'Your app',
        copy: 'A fast, branded web app built around the first job your business needs it to do.',
        items: ['Branded website', 'Installable PWA', 'Accounts where needed'],
        icon: 'i-lucide-smartphone',
        to: '/solutions/app-for-small-business',
        action: 'See the app offer',
        accent: 'var(--ui-primary)',
      },
      {
        eyebrow: 'For the people doing the work',
        title: 'Your console',
        copy: 'A private operator surface for the workflow, people, and information behind the app.',
        items: ['Operator console', 'One focused workflow', 'Room to add operations'],
        icon: 'i-lucide-panels-top-left',
        to: '/operations',
        action: 'Explore operations',
        accent: 'var(--color-warning-500)',
      },
      {
        eyebrow: 'For keeping it running',
        title: 'FireUX care',
        copy: 'The platform work stays with us, so your app can improve without becoming another abandoned build.',
        items: ['Hosting and deployment', 'Platform updates', 'Ongoing maintenance'],
        icon: 'i-lucide-flame',
        to: '/modules',
        action: 'Browse the modules',
        accent: 'var(--color-orange-500)',
      },
    ],
  },
  showcase: {
    badge: 'No payment in the form',
    eyebrow: 'Ignition',
    title: 'A real request, not a sales call.',
    description:
      'Tell us the business, the one job, the pages, and who needs access. We review it, agree the scope, configure the app, then launch it.',
    action: {
      label: 'Start your request',
      to: '/get-started#ignition-request',
      icon: 'i-lucide-arrow-right',
    },
    experiences: [
      {
        eyebrow: '01 · Request',
        title: 'Ignition intake',
        copy: 'Give us the business, users, pages, and first job.',
        icon: 'i-lucide-send',
        to: '/get-started#ignition-request',
      },
      {
        eyebrow: '02 · Configure',
        title: 'App scope',
        copy: 'Agree what launches now and what can wait.',
        icon: 'i-lucide-list-checks',
        to: '/operations/ignition',
      },
      {
        eyebrow: '03 · Run',
        title: 'Project Console',
        copy: 'Keep the app, ecosystem, users, and next work together.',
        icon: 'i-lucide-panels-top-left',
        to: '/console/project',
      },
    ],
  },
  operations: {
    eyebrow: 'Project operations',
    title: 'The FireUX control plane.',
    description:
      'FireUX keeps each project organised around Ignition, its apps, its ecosystem, and its users.',
    action: {
      label: 'Open all operations',
      to: '/operations',
    },
    items: operations,
  },
  audiences: {
    eyebrow: 'Where to start',
    title: 'Pick the path that fits.',
    items: [
      {
        title: 'I need an app',
        copy: 'Start with one useful job, your brand, and the people who need access.',
        action: 'Request Ignition',
        to: '/get-started#ignition-request',
        icon: 'i-lucide-rocket',
      },
      {
        title: 'I know the problem',
        copy: 'See FireUX offers for customer portals, staff apps, bookings, directories, and more.',
        action: 'Browse solutions',
        to: '/solutions',
        icon: 'i-lucide-search-check',
      },
      {
        title: 'An ecosystem may fit',
        copy: 'Start with an existing FireUX ecosystem when it already covers the work.',
        action: 'Explore ecosystems',
        to: '/ecosystems',
        icon: 'i-lucide-orbit',
      },
    ],
  },
  finalCta: {
    eyebrow: 'Ignition',
    title: 'Tell us the one job.',
    description:
      'We will tell you whether an existing ecosystem, a managed FireUX app, or a standalone build is the best fit.',
    primaryAction: {
      label: 'Request Ignition',
      to: '/get-started#ignition-request',
      icon: 'i-lucide-rocket',
    },
    secondaryAction: {
      label: 'Browse apps first',
      to: '/apps',
      icon: 'i-lucide-layout-grid',
    },
  },
} as const satisfies LandingProductIndexContent
</script>
