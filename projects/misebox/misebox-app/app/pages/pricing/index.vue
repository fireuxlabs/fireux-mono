<template>
  <PublicPricingPage
    title="One Misebox membership. Kitchen and Jobs together."
    :description="description"
    :plan-groups="planGroups"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        Post permanent jobs freely, coordinate one temporary engagement, and
        run a Kitchen workspace. Premium adds operating depth and concurrent
        temporary engagements without taking a cut from anyone’s wages.
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
  'Hire people and run the operation in one connected Misebox workspace.'

const planGroups = [
  {
    id: 'misebox-workspace',
    title: 'Misebox workspace',
    description:
      'Permanent hiring stays free. Premium adds concurrent temporary engagements and deeper Kitchen operations.',
    plans: [
      {
        id: 'free',
        title: 'Misebox Free',
        description: 'Hire and start operating.',
        price: 'CHF 0',
        priceCurrency: 'CHF',
        features: [
          'One Kitchen workspace',
          'One published menu',
          'Unlimited permanent and fixed-term job posts and hires',
          'Unlimited temporary job advertising',
          'One active temporary engagement',
          'Applications, offers and hire tracking',
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
        description: 'Coordinate the whole operation.',
        price: 'CHF 20',
        priceCurrency: 'CHF',
        billingCycle: '/month',
        features: [
          'Everything in Free',
          'Multiple active temporary engagements',
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

const seoTitle = 'Kitchen and Jobs pricing · Misebox'
const seoDescription =
  'Start hiring and operating free, upgrade to Misebox Premium for CHF 20 per month for concurrent temporary engagements and advanced Kitchen operations, or choose managed setup.'

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
