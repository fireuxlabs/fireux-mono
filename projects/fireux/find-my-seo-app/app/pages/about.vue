<template>
  <PublicSimplePage
    title="About"
    description="Find My SEO helps people discover SEO professionals."
    back-label="Find My SEO"
  >
    <section class="space-y-4">
      <p class="text-muted">
        Find My SEO is a FireUX standalone app for public SEO profiles, services, and discovery surfaces.
      </p>

      <p class="text-muted">
        The first version focuses on profile and directory pages before adding heavier marketplace mechanics.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/professionals"
        icon="i-lucide-users"
        size="lg"
      >
        Browse professionals
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About - Find My SEO',
  description: 'Find My SEO helps people discover SEO professionals.',
})
</script>
