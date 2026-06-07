<template>
  <main class="landing-cover">
    <img src="/img/gallery/image-1.png" alt="La Tap Berne terrace food">
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'La Tap Berne',
  description: 'Public menu and venue page for La Tap Berne.',
})
</script>

<style scoped>
.landing-cover {
  min-height: 100svh;
  margin: 0;
  background: #1f1a14;
}

.landing-cover img {
  display: block;
  width: 100%;
  min-height: 100svh;
  object-fit: cover;
  object-position: center bottom;
}
</style>
