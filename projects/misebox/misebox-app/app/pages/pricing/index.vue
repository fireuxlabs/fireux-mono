<template>
  <PublicPricingPage
    title="One Kitchen Console. Four ways to run it."
    :description="description"
    :plan-groups="planGroups"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        Start free, add the operational tools your team needs, ask us to manage
        the setup, or put the same Misebox system behind your own brand.
      </p>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
const contactEmail = 'misebox@misebox.app'
const enquiryButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

const description =
  'Choose the level of capability, support and branding that fits your restaurant.'

const planGroups = [
  {
    id: 'kitchen-console',
    title: 'Kitchen Console',
    description:
      'Free helps you create and publish. Premium helps your team run the operation.',
    plans: [
      {
        id: 'free',
        title: 'Misebox Free',
        description: 'Create and publish.',
        price: 'CHF 0',
        priceCurrency: 'CHF',
        features: [
          'One Kitchen workspace',
          'One published menu',
          'Dishes, recipes and ingredients',
          'A Misebox-branded QR menu',
          'Self-service setup',
        ],
        button: {
          ...enquiryButton,
          label: 'Start free',
          to: '/get-started',
        },
      },
      {
        id: 'premium',
        title: 'Misebox Premium',
        description: 'Run the operation.',
        price: 'CHF 20',
        priceCurrency: 'CHF',
        billingCycle: '/month',
        features: [
          'Everything in Free',
          'Multiple menus',
          'Team access and permissions',
          'Preparation, stations, tables and orders',
          'Suppliers, costing and finance views',
          'Multilingual menus and advanced branding',
        ],
        highlight: true,
        scale: true,
        button: {
          ...enquiryButton,
          label: 'Choose Premium',
          to: '/get-started',
        },
      },
    ],
  },
  {
    id: 'service-and-branding',
    title: 'Service and branding',
    description:
      'The same Kitchen Console, with hands-on help or a dedicated identity.',
    plans: [
      {
        id: 'managed',
        title: 'Managed Misebox',
        description: 'Let us manage the system with you.',
        price: 'CHF 50',
        priceCurrency: 'CHF',
        billingCycle: '/month',
        features: [
          'Everything in Premium',
          'Initial workspace and menu setup',
          'Brand, QR and team configuration',
          'Help importing menu and supplier information',
          'Agreed monthly content updates',
          'Priority assistance',
        ],
        button: {
          ...enquiryButton,
          label: 'Ask about Managed',
          href: `mailto:${contactEmail}?subject=Managed%20Misebox`,
        },
      },
      {
        id: 'dedicated',
        title: 'Dedicated App',
        description: 'Make Misebox entirely yours.',
        price: 'CHF 600',
        priceCurrency: 'CHF',
        billingPeriod: 'setup',
        features: [
          'Your own branding and web address',
          'A dedicated landing, menu and QR experience',
          'Selected Misebox modules',
          'CHF 20/month self-managed',
          'CHF 50/month managed',
          'A configured Misebox deployment—not bespoke software',
        ],
        button: {
          ...enquiryButton,
          label: 'Discuss a Dedicated App',
          href: `mailto:${contactEmail}?subject=Dedicated%20Misebox%20App`,
        },
      },
    ],
  },
] as const

const seoTitle = 'Kitchen Console pricing · Misebox'
const seoDescription =
  'Start a Misebox Kitchen Console free, upgrade to Premium for CHF 20 per month, choose Managed Misebox for CHF 50 per month, or launch a Dedicated App.'

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
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterCard: 'summary',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})
</script>
