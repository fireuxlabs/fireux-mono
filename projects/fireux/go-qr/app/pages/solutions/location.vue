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
  title: 'Location',
  description: 'Create a QR code that opens a location or map pin.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Location - Go QR',
  description: solution.description,
})
</script>
