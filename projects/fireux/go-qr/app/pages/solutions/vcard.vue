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
  title: 'vCard',
  description: 'Create a QR code that saves contact details.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'vCard - Go QR',
  description: solution.description,
})
</script>
