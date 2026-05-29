<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolUrl class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'url',
  title: 'URL',
  description: 'Turn a URL into a scannable QR code.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'URL - Go QR',
  description: solution.description,
})
</script>
