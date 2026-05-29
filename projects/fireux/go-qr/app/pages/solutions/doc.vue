<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolDoc class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  title: 'Doc',
  description: 'hello from Go QR solution doc',
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
