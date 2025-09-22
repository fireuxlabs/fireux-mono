<template>
  <div class="page">
    <!-- Hero Component -->
    <LandingHero />

    <!-- Solutions Component -->
    <LandingSolutions />

    <!-- Features Component - First Set -->
    <LandingFeatures :first="true" />

    <!-- Features Component - Second Set -->
    <LandingFeatures :second="true" />

    <!-- Integrations Component -->
    <LandingIntegrations />

    <!-- Call to Action (Nuxt UI PageCta) -->
    <PageCta
      title="Ready to try Misebox?"
      description="Sign in to create your first profile and explore the kitchen tools."
      :links="[
        {
          label: 'Get started',
          to: '/auth',
          color: 'primary',
          icon: 'i-heroicons-rocket-launch-20-solid',
        },
        {
          label: 'Learn more',
          to: 'https://ui4.nuxt.com',
          target: '_blank',
          variant: 'ghost',
          color: 'neutral',
        },
      ]"
    />

    <!-- CMS content removed for now to speed up dev and avoid Nuxt Content dependency -->
  </div>
</template>

<script setup>
// SEO and Meta
useSeoMeta({
  title: 'Misebox - Professional Kitchen Management Platform',
  description:
    'Master your culinary operations with digital recipe management, inventory control, and cost analysis. Built for chefs who demand precision.',
})

// CMS content disabled during early dev
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
