<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolPhone class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'phone',
  title: 'Phone',
  description: 'Create a QR code that starts a phone call.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Phone - Go QR',
  description: solution.description,
})
</script>
