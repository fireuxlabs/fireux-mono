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
  title: 'PDF',
  description: 'Upload a PDF and give people a QR code that opens it.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'PDF - Go QR',
  description: solution.description,
})
</script>
