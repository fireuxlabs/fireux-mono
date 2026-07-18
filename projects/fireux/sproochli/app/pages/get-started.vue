<template>
  <PublicSimplePage
    title="Get Started"
    description="Create a QR-ready language surface for public visitor information."
    back-label="Sproochli"
  >
    <section class="space-y-4">
      <ol class="list-decimal fx-list-stack text-muted">
        <li>Choose the public content you want visitors to scan.</li>
        <li>Publish a simple QR-ready page.</li>
        <li>Add translation when the content is ready for it.</li>
      </ol>
    </section>

    <template #actions>
      <UButton
        to="/menus"
        icon="i-lucide-languages"
        size="lg"
      >
        View menu examples
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
  title: 'Get Started - Sproochli',
  description: 'Start with Sproochli by publishing QR-ready visitor information and adding translation when the content is ready.',
})
</script>
