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
  title: 'Wi-Fi',
  description: 'Create a QR code that lets guests join a Wi-Fi network.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Wi-Fi - Go QR',
  description: solution.description,
})
</script>
