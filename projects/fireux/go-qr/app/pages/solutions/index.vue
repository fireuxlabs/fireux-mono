<template>
  <PublicSimplePage
    title="Solutions"
    description="Choose the QR primitive you need."
    back-to="/"
    back-label="Go QR"
  >
    <LandingSolutions
      variant="preview"
      :limit="99"
      title="What do you need a QR code for?"
      subtitle="Pick the thing people should open, save, join, or contact after they scan."
      always-show-more-button
    />
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Solutions - Go QR',
  description: 'Choose a Go QR primitive.',
})
</script>
