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
  title: 'Feedback link',
  description: 'Create a QR code that opens a feedback or survey form.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Feedback link - Go QR',
  description: solution.description,
})
</script>
