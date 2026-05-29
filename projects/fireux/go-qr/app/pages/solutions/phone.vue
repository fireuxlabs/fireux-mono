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
  title: 'Phone',
  description: 'Create a QR code that starts a phone call.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Phone - Go QR',
  description: solution.description,
})
</script>
