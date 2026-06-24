<template>
  <section class="landing-stage">
    <img
      class="landing-cover"
      src="/img/gallery/image-1.png"
      alt="La Tap Berne terrace food"
    >
    <div class="landing-wash" />

    <LaTapBerneMenuReveal />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: 'La Tap Berne',
  description: 'Public menu and venue page for La Tap Berne.',
})
</script>

<style scoped>
.landing-stage {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background: var(--brand-ink);
  --landing-wash-rgb: var(--brand-accent-rgb, 154 101 0);
}

.landing-cover,
.landing-wash {
  position: absolute;
  inset: 0;
}

.landing-cover {
  z-index: 0;
  display: block;
  width: 100%;
  height: 100svh;
  object-fit: cover;
  object-position: center bottom;
}

.landing-wash {
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgb(var(--landing-wash-rgb) / 48%) 0%,
    rgb(var(--landing-wash-rgb) / 26%) 10%,
    rgb(var(--landing-wash-rgb) / 10%) 22%,
    rgb(var(--landing-wash-rgb) / 0%) 36%,
    rgb(var(--landing-wash-rgb) / 0%) 100%
  );
  pointer-events: none;
}
</style>
