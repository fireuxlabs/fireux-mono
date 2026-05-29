<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolText class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'text',
  title: 'Text',
  description: 'Send any message as a QR code.',
}

useSeoMeta({
  title: 'Text - Go QR',
  description: solution.description,
})
</script>
