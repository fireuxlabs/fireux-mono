<template>
  <PublicSimplePage
    title="About"
    description="BuenoHost turns stay information into a digital guest guide."
    back-label="BuenoHost"
  >
    <section class="space-y-4">
      <p class="text-muted">
        BuenoHost is a FireUX standalone app for simple guest guides, house information, local notes, and QR-ready stay companions.
      </p>

      <p class="text-muted">
        It starts small: one property, one guide, one QR surface. More property management features can grow from that clean base later.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/"
        icon="i-lucide-home"
        size="lg"
      >
        Back to BuenoHost
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
  title: 'About - BuenoHost',
  description: 'BuenoHost turns stay information into a digital guest guide.',
})
</script>
