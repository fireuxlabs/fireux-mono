<template>
  <PublicSimplePage
    title="About"
    description="Sproochli is the FireUX language layer for public visitor information."
    back-label="Sproochli"
  >
    <section class="space-y-4">
      <p class="text-muted">
        Sproochli helps hospitality and local businesses publish visitor-facing information that can later be translated, localised, and shared by QR code.
      </p>

      <p class="text-muted">
        It is designed to sit alongside FireUX apps such as Misebox, BuenoHost, and Go QR instead of becoming a separate custom website every time.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/"
        icon="i-lucide-home"
        size="lg"
      >
        Back to Sproochli
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
  title: 'About - Sproochli',
  description: 'Sproochli is the FireUX language layer for public visitor information.',
})
</script>
