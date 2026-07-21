<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the conservative Werkbox price ladder. -->
<template>
  <PublicPricingPage
    title="Werkbox pricing"
    description="Start free. Pay for shared tools when they help. Move to your own app only when you need one."
    :plan-groups="planGroups"
  >
    <template #actions>
      <UButton
        to="mailto:fire@fireux.app?subject=Join%20Werkbox"
        icon="i-lucide-mail"
      >
        Ask to join Werkbox
      </UButton>
      <UButton to="/ecosystems/werkbox/cleaning" color="neutral" variant="soft">
        Cleaning on Werkbox
      </UButton>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
const contactButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

const sharedPlans = [
  {
    id: 'free',
    title: 'Free',
    description: 'Join Werkbox and see whether it fits your work.',
    price: '$0',
    billingCycle: '/month',
    features: [
      'Shared Werkbox access',
      'Business or provider profile',
      'No setup fee',
    ],
    button: {
      ...contactButton,
      label: 'Ask to join',
      to: 'mailto:fire@fireux.app?subject=Join%20Werkbox%20Free',
    },
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Run the work yourself using the shared Werkbox app.',
    price: '$20',
    billingCycle: '/month',
    features: [
      'Customer and job workspace',
      'Self-managed configuration',
      'Werkbox service network',
    ],
    highlight: true,
    scale: true,
    button: {
      ...contactButton,
      label: 'Choose Pro',
      to: 'mailto:fire@fireux.app?subject=Werkbox%20Pro',
    },
  },
  {
    id: 'managed',
    title: 'Managed',
    description: 'Use Werkbox with configuration and operational help from FireUX.',
    price: '$50',
    billingCycle: '/month',
    features: [
      'Everything in Pro',
      'Help configuring existing features',
      'New development quoted separately',
    ],
    button: {
      ...contactButton,
      label: 'Choose Managed',
      to: 'mailto:fire@fireux.app?subject=Werkbox%20Managed',
    },
  },
] as const

const dedicatedPlans = [
  {
    id: 'dedicated-app',
    title: 'Dedicated Werkbox App',
    description: 'Move to your own branded Werkbox app after the shared app has proved useful.',
    price: '$600',
    billingPeriod: 'setup',
    features: [
      'Your name and branding',
      'Connected to the Werkbox ecosystem',
      '$20/month self-managed',
      '$50/month managed',
    ],
    button: {
      ...contactButton,
      label: 'Ask about your own app',
      to: 'mailto:fire@fireux.app?subject=Dedicated%20Werkbox%20App',
    },
  },
] as const

const planGroups = [
  {
    id: 'shared',
    title: 'Shared Werkbox',
    description: 'The right place to start.',
    plans: sharedPlans,
  },
  {
    id: 'dedicated',
    title: 'Your own app',
    description: 'Upgrade only when the business needs its own branded app.',
    plans: dedicatedPlans,
  },
] as const

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Werkbox Pricing · FireUX',
  description: 'Start Werkbox free, upgrade to $20 or $50 per month, or move to a dedicated app from $600 setup.',
})
</script>
