<template>
  <UPageHero
    headline="Independent bike shop · Interlaken"
    title="Ride something different."
    description="Vintage steel, modern adventure bikes, rare components and excellent things to wear on and off the bike."
    :links="links"
  >
    <img
      src="/img/yellow-velo/hero.png"
      alt="Yellow Velo bicycle showroom in Interlaken"
      width="1774"
      height="887"
      fetchpriority="high"
    />
  </UPageHero>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const links: ButtonProps[] = [
  { label: 'Enter the shop', to: '/products', icon: 'i-lucide-arrow-right' },
  {
    label: 'Explore the tours',
    to: '/#tours',
    color: 'neutral',
    variant: 'outline',
  },
]
</script>
