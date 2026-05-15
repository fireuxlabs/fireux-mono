<template>
  <LandingSolutions
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle = 'Profiles, proof, and better-fit enquiries without console sprawl.'

const items = [
  {
    title: 'Browse providers',
    description: 'Search consultants and agencies by specialism, sector fit, and project type before you enquire.',
    to: '/professionals',
    icon: 'i-lucide-search',
  },
  {
    title: 'Review case studies',
    description: 'Compare structured proof rather than relying on vague SEO positioning.',
    to: '/case-studies',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'Create your profile',
    description: 'Open the lightweight onboarding path for SEO users and start collecting leads.',
    to: '/dashboard/professional',
    icon: 'i-lucide-rocket',
  },
]
</script>
