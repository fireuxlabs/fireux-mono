<template>
  <SolutionPage :solution="solution">
    <SolutionTool :solution="solution">
      <GoQrToolText class="w-full max-w-xl" />
    </SolutionTool>
  </SolutionPage>
</template>

<script setup lang="ts">
const solution = {
  title: 'Text',
  description: 'Test the Go QR text tool from Misebox.',
  instructions: [],
  integrations: {
    body: '',
    items: [],
  },
  upgrades: [],
  dev: {
    endpoints: [],
  },
  seo: {
    title: 'Text',
    ogTitle: 'Text',
    twitterTitle: 'Text',
    description: 'Test the Go QR text tool from Misebox.',
    ogDescription: 'Test the Go QR text tool from Misebox.',
    twitterDescription: 'Test the Go QR text tool from Misebox.',
  },
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta(solution.seo)
</script>
