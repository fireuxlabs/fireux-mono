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
  title: 'Review link',
  description: 'Create a QR code that sends customers to a review page.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Review link - Go QR',
  description: solution.description,
})
</script>
