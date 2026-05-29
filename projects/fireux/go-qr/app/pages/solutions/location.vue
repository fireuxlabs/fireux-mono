<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolLocation class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'location',
  title: 'Location',
  description: 'Create a QR code that opens a location or map pin.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Location - Go QR',
  description: solution.description,
})
</script>
