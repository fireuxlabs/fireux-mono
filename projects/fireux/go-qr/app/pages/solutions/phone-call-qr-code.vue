<template>
  <PublicSimplePage
    title="Phone Call QR Code"
    description="Create a QR code that starts a phone call."
    back-to="/solutions"
    back-label="Solutions"
  >
    <ClientOnly>
      <GoQrInstantPanel
        type="phone"
        title="Phone"
        input-label="Phone number"
        placeholder="+41790000000"
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
  title: 'Phone Call QR Code - Go QR',
  ogTitle: 'Phone Call QR Code - Go QR',
  twitterTitle: 'Phone Call QR Code - Go QR',
  description: 'Create a QR code that starts a phone call with Go QR.',
  ogDescription: 'Create a QR code that starts a phone call with Go QR.',
  twitterDescription: 'Create a QR code that starts a phone call with Go QR.',
})
</script>
