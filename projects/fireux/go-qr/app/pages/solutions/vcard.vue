<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolVcard class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'vcard',
  title: 'vCard',
  description: 'Create a QR code that saves contact details.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'vCard - Go QR',
  description: solution.description,
})
</script>
