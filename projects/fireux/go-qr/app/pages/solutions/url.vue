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
  title: 'URL',
  description: 'Turn a URL into a scannable QR code.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'URL - Go QR',
  description: solution.description,
})
</script>
