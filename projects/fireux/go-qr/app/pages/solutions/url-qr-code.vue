<template>
  <PublicSimplePage
    title="URL QR Code"
    description="Turn a URL into a scannable QR code."
    back-to="/solutions"
    back-label="Solutions"
  >
    <ClientOnly>
      <GoQrInstantPanel
        type="url"
        title="URL"
        input-label="URL"
        placeholder="https://example.com"
      />
    </ClientOnly>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'URL QR Code - Go QR',
  ogTitle: 'URL QR Code - Go QR',
  twitterTitle: 'URL QR Code - Go QR',
  description: 'Create a QR code for a URL with Go QR.',
  ogDescription: 'Create a QR code for a URL with Go QR.',
  twitterDescription: 'Create a QR code for a URL with Go QR.',
})
</script>
