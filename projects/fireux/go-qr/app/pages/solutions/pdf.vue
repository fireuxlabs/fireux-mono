<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolPdf />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'pdf',
  title: 'PDF',
  description: 'Upload a PDF and give people a QR code that opens it.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'PDF - Go QR',
  description: solution.description,
})
</script>
