<template>
  <!-- Background effect (Misebox) -->
  <EffectsSteam />

  <LandingShell>
    <template #left>
      <LandingHero />
    </template>
    <template #right>
      <div class="space-y-6 lg:pl-4">
        <LandingBrandBadge />
        <LandingQuickLinks />
      </div>
    </template>
  </LandingShell>
  <USeparator
    :avatar="{
      src: '/img/app/logo.png',
    }"
    color="primary"
  />
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />

  <USeparator
    :avatar="{
      src: '/img/app/logo.png',
    }"
    color="primary"
  />
</template>

<script setup lang="ts">
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
  title: 'Misebox — Hospitality Jobs',
  description:
    'Create jobs, showcase kitchens, and build professional profiles for hospitality.',
})

const solutions = {
  title: 'Get started',
  subtitle: 'Post jobs, review professionals, and hire faster.',
  items: [
    {
      title: 'Post a job',
      description: 'Use quick create to get your job posted fast.',
      to: '/jobs',
      cta: 'View jobs',
      icon: 'i-lucide-briefcase',
    },
    {
      title: 'Browse professionals',
      description: 'Search our database of vetted professionals.',
      to: '/professionals',
      cta: 'Browse professionals',
      icon: 'i-lucide-user',
    },
    {
      title: 'Showcase your kitchen',
      description: 'Get your kitchen noticed for its menu and culture.',
      to: '/kitchens',
      cta: 'Browse kitchens',
      icon: 'i-lucide-chef-hat',
    },
  ],
}
</script>
