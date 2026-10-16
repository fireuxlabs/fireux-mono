<template>
  <UContainer class="py-12 space-y-6">
    <h1 class="text-3xl font-semibold">QR Menu</h1>
    <p>
      Create an interactive Menu or upload a document, publish it, then print
      its QR code.
    </p>
    <MenuCreate />
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useSeoMeta({
  title: 'QR Menu - Misebox',
  description: 'Create and publish your Kitchen Menu with a printable QR code.',
})
</script>
