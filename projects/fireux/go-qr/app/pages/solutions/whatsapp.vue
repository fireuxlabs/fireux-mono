<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolWhatsapp class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'whatsapp',
  title: 'WhatsApp',
  description: 'Create a QR code that opens a WhatsApp chat.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'WhatsApp - Go QR',
  description: solution.description,
})
</script>
