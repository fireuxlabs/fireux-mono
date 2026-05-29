<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrSolutionTool :solution="solution">
      <GoQrToolPlaceholder :name="solution.title" />
    </GoQrSolutionTool>
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  title: 'WhatsApp',
  description: 'Create a QR code that opens a WhatsApp chat.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'WhatsApp - Go QR',
  description: solution.description,
})
</script>
