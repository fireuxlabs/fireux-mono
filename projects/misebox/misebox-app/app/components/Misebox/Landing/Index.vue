<!-- Concurrent edit — 2026-07-23 09:40 CEST — Lead with the restaurant job, live product scope, and safe proof. -->
<template>
  <LandingProductIndex :content="content">
    <template #hero-preview>
      <MiseboxLandingPreview />
    </template>

    <template #apps>
      <LandingAppCollection
        :controller="appsController"
        eyebrow="Our apps"
        title="Different businesses. One shared Misebox foundation."
        description="Explore hospitality Apps that connect public content, restaurant operations and team access while keeping their own identity and workflow."
        action-label="Explore all Misebox apps"
        action-to="/apps"
        fallback-description="A live hospitality app built on the Misebox ecosystem."
        :exclude-ids="['misebox-app']"
      />
    </template>
  </LandingProductIndex>
</template>

<script setup lang="ts">
import type { LandingProductIndexContent } from 'fireux-core/types/landing-product'
import { useEcosystemAppCollection } from 'fireux-core/runtime/composables/fireux/public/app/useEcosystemAppCollection'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'
import MiseboxLandingPreview from './Preview.vue'

const appsController = useEcosystemAppCollection()

const operations = kitchenOperations
  .filter(operation => operation.slug)
  .map(operation => ({
    ...operation,
    to: `/operations/${operation.slug}`,
  }))

const content = {
  hero: {
    badge: 'Menu and kitchen management',
    kicker: 'For restaurant teams.',
    title: 'Manage your menu and kitchen',
    accent: 'in one place.',
    description:
      'Publish menus, organise prep and manage orders with Misebox.',
    primaryAction: {
      label: 'Try the interactive demo',
      to: '/demo',
    },
    secondaryAction: {
      label: 'See what works today',
      to: '/operations',
      icon: 'i-lucide-list-checks',
    },
    quietAction: {
      label: 'Explore public Kitchens',
      to: '/kitchens',
    },
    trustItems: [
      'No signup required',
      'Sample restaurant data',
      'No live order is created',
    ],
  },
  operatingLoop: [
    {
      title: 'Publish',
      copy: 'A clear menu for guests',
      icon: 'i-lucide-book-open',
      to: '/menus',
    },
    {
      title: 'Connect',
      copy: 'Dishes and recipes',
      icon: 'i-lucide-network',
      to: '/operations/dishes',
    },
    {
      title: 'Prepare',
      copy: 'Prep work by station',
      icon: 'i-lucide-list-checks',
      to: '/operations/mise',
    },
    {
      title: 'Serve',
      copy: 'Orders through handoff',
      icon: 'i-lucide-bell-ring',
      to: '/operations/orders',
    },
  ],
  system: {
    eyebrow: 'The problem Misebox solves',
    title: 'Your menu should not be copied into five different tools.',
    description:
      'When a dish changes, the team should not have to update a PDF, recipe sheet, prep list, ordering tool and service message separately. Misebox connects that work around one Kitchen-owned menu.',
    areas: [
      {
        eyebrow: 'For guests',
        title: 'Publish what you actually serve',
        copy: 'Build a structured menu that stays connected to the Kitchen and dishes behind it.',
        items: ['Structured public menus', 'QR-ready menu routes', 'Menu and Kitchen identity'],
        icon: 'i-lucide-qr-code',
        to: '/demo/menu',
        action: 'See the Menu demo',
        accent: 'var(--ui-primary)',
      },
      {
        eyebrow: 'For prep',
        title: 'Turn dishes into kitchen work',
        copy: 'Keep dishes and recipes close to the prep plan your team uses before service.',
        items: ['Dishes and recipes', 'Mise tasks', 'Kitchen stations'],
        icon: 'i-lucide-notebook-tabs',
        to: '/operations/mise',
        action: 'See the Mise operation',
        accent: '#d6aa68',
      },
      {
        eyebrow: 'For service',
        title: 'Carry orders through handoff',
        copy: 'Let guest choices arrive as clear Kitchen tickets that move from intake to ready.',
        items: ['Kiosk order flow', 'Kitchen order board', 'Ready-to-handoff states'],
        icon: 'i-lucide-bell-ring',
        to: '/demo/service',
        action: 'Run the service demo',
        accent: '#c87855',
      },
    ],
  },
  showcase: {
    badge: 'No signup · Sample restaurant · No live order',
    eyebrow: 'Try it before you set anything up',
    title: 'Follow one menu from guest choice to kitchen handoff.',
    description:
      'The interactive demo uses real Misebox Menu, Kiosk and Kitchen Order components with safe sample data. See the connected workflow without touching a live Kitchen.',
    action: {
      label: 'Try the interactive demo',
      to: '/demo',
    },
    experiences: [
      {
        eyebrow: 'Guest perspective',
        title: 'Responsive Menu',
        copy: 'Browse a structured restaurant menu on any screen.',
        icon: 'i-lucide-book-open-text',
        to: '/demo/menu',
      },
      {
        eyebrow: 'Ordering perspective',
        title: 'Touch-first Kiosk',
        copy: 'Build an order through the same Menu catalogue.',
        icon: 'i-lucide-monitor-smartphone',
        to: '/demo/kiosk',
      },
      {
        eyebrow: 'Kitchen perspective',
        title: 'Service board',
        copy: 'Move tickets from intake to ready for handoff.',
        icon: 'i-lucide-panels-top-left',
        to: '/demo/service',
      },
    ],
  },
  operations: {
    eyebrow: 'What works today',
    title: 'Open the working Kitchen tools—not a roadmap.',
    description:
      'This factual catalogue links to the Kitchen Console operations that exist now, so you can inspect the product without decoding a feature promise.',
    action: {
      label: 'See all working Operations',
      to: '/operations',
    },
    items: operations,
  },
  audiences: {
    eyebrow: 'Start with the kitchen',
    title: 'One connected workflow across your restaurant team.',
    items: [
      {
        title: 'Owners and operators',
        copy: 'Publish the menu and give the Kitchen one place to manage the work connected to it.',
        action: 'Create a Kitchen workspace',
        to: '/get-started',
        icon: 'i-lucide-store',
      },
      {
        title: 'Prep and production teams',
        copy: 'Move from dishes and recipes into visible prep work organised around stations.',
        action: 'Explore kitchen prep',
        to: '/operations/mise',
        icon: 'i-lucide-chef-hat',
      },
      {
        title: 'Service teams',
        copy: 'See guest orders enter a clear Kitchen queue and move toward a ready handoff.',
        action: 'Try the service demo',
        to: '/demo/service',
        icon: 'i-lucide-bell-ring',
      },
    ],
  },
  finalCta: {
    eyebrow: 'See the workflow, then decide',
    title: 'Start with a working demo—not another promise.',
    description:
      'Use the sample restaurant to explore the menu, kiosk and Kitchen order handoff. No account, no setup and no live order.',
    primaryAction: {
      label: 'Try the interactive demo',
      to: '/demo',
    },
    secondaryAction: {
      label: 'Create a Kitchen workspace',
      to: '/get-started',
    },
  },
} as const satisfies LandingProductIndexContent
</script>
