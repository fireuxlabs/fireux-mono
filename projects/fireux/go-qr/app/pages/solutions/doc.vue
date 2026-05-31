<template>
  <GoQrSolutionPage :solution="solution">
    <iframe
      src="/tools/doc"
      title="Go QR doc tool"
      class="mx-auto h-[34rem] w-full max-w-xl rounded-lg border border-default"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
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
