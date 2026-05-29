<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolReviewLink class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'review-link',
  title: 'Review link',
  description: 'Create a QR code that sends customers to a review page.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Review link - Go QR',
  description: solution.description,
})
</script>
