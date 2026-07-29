<template>
  <PublicPricingPage
    title="FireUX pricing"
    description="Choose an app, ecosystem, or operator plan."
    :plans="hubPlans"
  >
    <template #actions>
      <UButton
        href="mailto:fire@fireux.app?subject=FireUX%20starter%20app"
        color="primary"
        icon="i-lucide-mail"
      >
        Ask about a starter app
      </UButton>
      <UButton to="/pricing/apps" color="neutral" variant="soft" icon="i-lucide-rocket">
        Compare app launches
      </UButton>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
const detailButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

const hubPlans = [
  {
    id: 'users',
    title: 'Users',
    description: 'Join free or add operator access.',
    price: '$5',
    billingCycle: '/month',
    features: ['Free account available', 'Operator access when you need it'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/users',
    },
  },
  {
    id: 'apps',
    title: 'Apps',
    description: 'Launch a branded FireUX App.',
    price: 'From $150',
    billingPeriod: 'setup',
    features: ['Maintenance from $15/month', 'Branding and hosting included'],
    highlight: true,
    scale: true,
    button: {
      ...detailButton,
      label: 'Details',
      to: '/pricing/apps',
    },
  },
  {
    id: 'ecosystems',
    title: 'Ecosystems',
    description: 'Build a home for repeatable customer apps.',
    price: '$400',
    billingPeriod: 'setup',
    features: ['Tenant apps from $100 setup', 'Best for repeatable industry workflows'],
    button: {
      ...detailButton,
      label: 'Details',
      to: '/ecosystems/pricing',
    },
  },
] as const

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Pricing · FireUX',
  description:
    'FireUX pricing for apps, ecosystems, and operator access.',
})
</script>
