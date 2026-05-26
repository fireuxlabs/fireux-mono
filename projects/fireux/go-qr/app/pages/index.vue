<template>
  <main class="min-h-screen bg-default text-default" data-entity-cta-family="utility-managed">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Upload a doc.<br />
          Get a QR code.
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Turn a public doc into a shareable QR page.
        </p>
        <p class="text-sm text-muted">
          Made for information people need to scan and read.
        </p>
      </header>

      <ClientOnly>
        <GoQrProviderPublicDocTool class="mx-auto max-w-xl" />
      </ClientOnly>

      <LandingSolutions variant="preview" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Go QR - Upload a doc. Get a QR code.',
  ogTitle: 'Go QR - Upload a doc. Get a QR code.',
  twitterTitle: 'Go QR - Upload a doc. Get a QR code.',
  description: 'Turn a public doc into a shareable QR page. Create your first QR doc free.',
  ogDescription: 'Turn a public doc into a shareable QR page. Create your first QR doc free.',
  twitterDescription: 'Turn a public doc into a shareable QR page. Create your first QR doc free.',
})
</script>
