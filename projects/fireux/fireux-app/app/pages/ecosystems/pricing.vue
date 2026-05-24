<template>
  <PublicPricingPage
    title="Ecosystem pricing"
    description="Create a branded FireUX ecosystem, then add tenant apps as the ecosystem grows."
    :plan-groups="planGroups"
  >
    <template #actions>
      <UButton to="/get-started" color="primary" icon="i-lucide-sparkles">
        Start an ecosystem
      </UButton>
      <UButton to="/ecosystems" color="neutral" variant="soft" icon="i-lucide-orbit">
        View ecosystems
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

const setupPlans = [
  {
    id: 'ecosystem-setup',
    title: 'Ecosystem setup',
    description: 'Create your own branded FireUX ecosystem.',
    price: '$1,000',
    billingPeriod: 'setup',
    features: [
      'Ecosystem identity',
      'Main app foundation',
      'Ready for tenant apps',
    ],
    button: {
      ...detailButton,
      label: 'Start',
      to: '/get-started',
    },
  },
  {
    id: 'tenant-app-setup',
    title: 'Tenant app setup',
    description: 'Add customer apps inside your ecosystem.',
    price: '$300',
    billingPeriod: 'per app setup',
    features: [
      'Customer app shell',
      'Ecosystem-linked setup',
      'Public app route and hosting',
    ],
    button: {
      ...detailButton,
      label: 'App pricing',
      to: '/pricing/apps',
    },
  },
] as const

const runningPlans = [
  {
    id: 'tenant-maintenance',
    title: 'Maintenance',
    description: 'Keep each tenant app hosted and maintained.',
    price: '$25',
    billingCycle: '/month',
    billingPeriod: 'per tenant app',
    features: [
      'Hosting upkeep',
      'Runtime updates',
      'Operational support',
    ],
  },
  {
    id: 'console-seats',
    title: 'Console seats',
    description: 'For admins and operators using the console.',
    price: '$5',
    billingCycle: '/month',
    billingPeriod: 'per seat',
    features: [
      'Admin console access',
      'Operator workspaces',
      'Billed per active seat',
    ],
  },
] as const

const planGroups = [
  {
    id: 'setup',
    title: 'Setup',
    plans: setupPlans,
  },
  {
    id: 'running-costs',
    title: 'Running costs',
    plans: runningPlans,
  },
] as const

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Ecosystem Pricing · FireUX',
  description:
    'Create a branded FireUX ecosystem from $1,000 setup, then add tenant apps from $300 setup with simple monthly maintenance.',
})
</script>
