<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolEvent />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'event',
  title: 'Event',
  description:
    'Create a QR code for event details, timing, location, or instructions.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Event - Go QR',
  description: solution.description,
})
</script>
