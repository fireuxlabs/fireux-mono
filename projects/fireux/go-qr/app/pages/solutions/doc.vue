<template>
  <GoQrSolutionPage :solution="solution">
    <ProviderGoQrTools
      tool="doc"
      :payload="tool"
      class="mx-auto w-full max-w-xl"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
const tool = {
  endpoints: {
    create: '/api/tools/doc/create',
    availability: '/api/tools/doc/availability',
  },
}

definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'doc',
  title: 'Doc',
  description: 'Upload a doc, choose a short path, and get a QR page.',
}

useSeoMeta({
  title: 'Doc - Go QR',
  ogTitle: 'Doc - Go QR',
  twitterTitle: 'Doc - Go QR',
  description: solution.description,
  ogDescription: solution.description,
  twitterDescription: solution.description,
})
</script>
