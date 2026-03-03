<template>
  <LandingSolutions
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle =
  'Kitchen operations, professionals, and roles - in one connected workspace.'

const items = [
  {
    title: 'Post a job',
    description: 'Use quick create to get your job posted fast.',
    to: '/jobs',
    icon: 'i-lucide-briefcase',
  },
  {
    title: 'Browse professionals',
    description: 'Search our database of vetted professionals.',
    to: '/professionals',
    icon: 'i-lucide-user',
  },
  {
    title: 'Showcase your kitchen',
    description: 'Get your kitchen noticed for its menu and culture.',
    to: '/kitchens',
    icon: 'i-lucide-chef-hat',
  },
]
</script>
