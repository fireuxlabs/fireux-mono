<template>
  <PublicSimplePage
    title="Get Started"
    description="Create or browse SEO professional profiles."
    back-label="Find My SEO"
  >
    <section class="space-y-4">
      <ol class="list-decimal fx-list-stack text-muted">
        <li>Browse public SEO professional profiles.</li>
        <li>Compare services, sectors, and proof.</li>
        <li>Create a provider profile when you are ready to be listed.</li>
      </ol>
    </section>

    <template #actions>
      <UButton
        to="/professionals"
        icon="i-lucide-search"
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
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started - Find My SEO',
  description: 'Get started with Find My SEO by browsing or creating public SEO professional profiles.',
})
</script>
