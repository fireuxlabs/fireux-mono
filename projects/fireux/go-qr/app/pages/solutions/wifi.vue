<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolWifi class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'wifi',
  title: 'Wi-Fi',
  description: 'Create a QR code that lets guests join a Wi-Fi network.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Wi-Fi - Go QR',
  description: solution.description,
})
</script>
