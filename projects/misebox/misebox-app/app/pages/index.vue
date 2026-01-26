<template>
  <!-- Background effect (Misebox) -->
  <EffectsSteam />

  <div>
    <LandingShell>
      <template #left>
        <LandingHero />
      </template>
      <template #right>
        <div class="space-y-6">
          <LandingBrandBadge />
          <LandingQuickPeek />
        </div>
      </template>
    </LandingShell>

    <LandingSolutions
      :title="solutions.title"
      :subtitle="solutions.subtitle"
      :items="solutions.items"
    />
  </div>
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
  subtitle: 'Post jobs fast, build profiles, and connect directly.',
  items: [
    {
      title: 'Jobs',
      description: 'Post a role and share a single link.',
      to: '/jobs',
      cta: 'View jobs',
      icon: 'i-lucide-briefcase',
      badge: 'Now',
    },
    {
      title: 'Professionals',
      description: 'Profiles instead of CVs or PDFs.',
      to: '/professionals',
      cta: 'Browse professionals',
      icon: 'i-lucide-user',
      badge: 'Now',
    },
    {
      title: 'Kitchens',
      description: 'Clear kitchen pages that attract the right hires.',
      to: '/kitchens',
      cta: 'Browse kitchens',
      icon: 'i-lucide-chef-hat',
      badge: 'Now',
    },
    {
      title: 'How it works',
      description: 'From profile to application to contact.',
      to: '/get-started',
      cta: 'See how',
      icon: 'i-lucide-route',
    },
    {
      title: 'Sign in',
      description: 'Manage your profile and job activity.',
      to: '/auth',
      cta: 'Sign in',
      icon: 'i-lucide-log-in',
    },
  ],
}
</script>
