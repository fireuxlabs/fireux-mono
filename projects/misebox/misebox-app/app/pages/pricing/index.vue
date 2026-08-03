<template>
  <PublicPricingPage
    title="One Misebox membership. Kitchen and Jobs together."
    :description="description"
    :plan-groups="planGroups"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        Post permanent jobs freely, coordinate one temporary engagement, and run
        a Kitchen workspace. Premium adds operating depth and concurrent
        temporary engagements without taking a cut from anyone’s wages.
      </p>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
import { miseboxPlanGroups } from '../../content/pricing'

const description =
  'Hire people and run the operation in one connected Misebox workspace.'

const planGroups = miseboxPlanGroups

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
