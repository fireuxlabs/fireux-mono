<template>
  <GoQrSolutionPage :solution="solution">
    <iframe
      src="/tools/url"
      title="Go QR URL tool"
      class="mx-auto h-[34rem] w-full max-w-xl border-0"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'url',
  title: 'URL',
  description: 'Create a QR code from any public URL.',
}

useSeoMeta({
  title: 'URL - Go QR',
  description: solution.description,
})
</script>
