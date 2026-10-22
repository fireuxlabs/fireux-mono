<template>
  <UPageHero
    :headline="fireuxOffer.category"
    :title="fireuxOffer.headline"
    :description="fireuxOffer.heroDescription"
    :links="links"
  />
</template>

<script setup lang="ts">
import { fireuxOffer } from '../../content/meta/source'

const links = [
  {
    label: 'Explore the offering',
    to: '#offering',
    icon: 'i-lucide-arrow-right',
    trailing: true,
  },
  {
    label: 'Build with FireUX',
    to: '/getting-started',
    color: 'neutral' as const,
    variant: 'outline' as const,
  },
]
</script>
