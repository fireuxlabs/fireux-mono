<template>
  <PublicSimplePage
    title="About"
    description="Go QR turns public docs into QR pages."
    back-label="Go QR"
  >
    <section class="space-y-4">
      <p class="text-muted">
        Upload a doc, choose a public path, and get a page people can open from a QR code.
      </p>

      <p class="text-muted">
        Go QR is part of the FireUX ecosystem and is designed for simple public information: text, links, notices, forms, and finished docs people need to scan and read.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/"
        icon="i-lucide-upload"
        size="lg"
      >
        Create a QR doc
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
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
  title: 'About - Go QR',
  ogTitle: 'About - Go QR',
  twitterTitle: 'About - Go QR',
  description: 'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
  ogDescription: 'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
  twitterDescription: 'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
})
</script>
