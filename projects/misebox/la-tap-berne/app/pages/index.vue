<template>
  <img
    class="landing-cover"
    src="/img/gallery/image-1.png"
    alt="La Tap Berne terrace food"
  >
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'misebox-tenant',
})

useSeoMeta({
  title: 'La Tap Berne',
  description: 'Public menu and venue page for La Tap Berne.',
})
</script>

<style scoped>
.landing-cover {
  display: block;
  width: 100%;
  height: 100svh;
  object-fit: cover;
  object-position: center bottom;
}
</style>
