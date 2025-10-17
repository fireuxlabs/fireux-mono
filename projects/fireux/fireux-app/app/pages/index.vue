<template>
  <!-- Landing Background Effect -->
  <EffectsStarfield />

  <!-- Main Content -->
  <div class="page">
    <!-- Unified Hero (replaces old LandingHero) -->
    <HeroPrimary
      line1="Ignite"
      line1After="with"
      line2="Powerful Applications"
      :links="[
        { label: 'Get Started', to: '/getting-started', color: 'primary' },
        {
          label: 'Explore Projects',
          href: 'https://fireux.app/projects',
          variant: 'ghost',
          color: 'neutral',
          icon: 'i-heroicons-arrow-right',
        },
      ]"
    >
      <template #description>
        A low-code ecosystem for responsive, scalable, and data-driven applications built upon
        <span class="text-primary">Nuxt4</span> & <span class="text-primary">Firebase</span>.
      </template>

      <template #brandmarks>
        <img src="/img/nuxt-white.png" alt="Nuxt logo" class="h-12 opacity-80" />
        <img src="/img/firebase-white.png" alt="Firebase logo" class="h-12 opacity-80" />
      </template>
    </HeroPrimary>

    <!-- Keep existing sections -->
    <LandingSolutions />
    <LandingSkillsIcons />
    <LandingProducts />
    <LandingFuel />
    <LandingFireUX />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'FireUX - Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core, manage data with Cleanbox, and deploy with Misebox.',
})
</script>

<style scoped>
.page {
  min-height: 60vh;
}
</style>