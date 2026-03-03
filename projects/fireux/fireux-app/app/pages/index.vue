<template>
  <EffectsStars />
  <LandingHeroSection />
  <div class="landing-index-divider">
    <USeparator
      :avatar="{
        src: '/img/app/logo.png',
        alt: 'FireUX',
      }"
      color="primary"
    />
  </div>

  <div class="landing-index-flow">
    <LandingGetStarted />
    <LandingProducts :items="products" />
    <LandingApps />
  </div>
</template>

<script setup lang="ts">
type LandingProductItem = {
  title: string
  description: string
  to: string
  logo?: string
  tag?: string
  tagColor?: 'primary' | 'neutral' | 'sky' | 'violet' | 'amber'
}

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
  title: 'FireUX — Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
})

const products = [
  {
    title: 'Cleanbox',
    description: 'Scheduling, QA, billing for crews.',
    to: '/cleanbox',
    logo: '/img/app/logo.png',
    tag: 'Ops',
    tagColor: 'sky',
  },
  {
    title: 'Misebox',
    description: 'Recipes, inventory, suppliers.',
    to: '/misebox',
    logo: '/img/app/logo.png',
    tag: 'Kitchen',
    tagColor: 'violet',
  },
  {
    title: 'FireUX',
    description: 'Nuxt + Firebase + Stripe core.',
    to: '/core',
    logo: '/img/app/logo.png',
    tag: 'Core',
    tagColor: 'primary',
  },
] satisfies LandingProductItem[]
</script>
