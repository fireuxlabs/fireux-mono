<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolFeedbackLink class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'feedback-link',
  title: 'Feedback link',
  description: 'Create a QR code that opens a feedback or survey form.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Feedback link - Go QR',
  description: solution.description,
})
</script>
