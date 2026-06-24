<template>
  <div
    class="latap-backdrop"
    :class="{ 'latap-backdrop--landing': variant === 'landing' }"
    aria-hidden="true"
  >
    <img
      class="latap-backdrop__image"
      :src="src"
      alt=""
    >
    <div class="latap-backdrop__wash" />
  </div>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../../config/content.config'

withDefaults(defineProps<{
  src?: string
  variant?: 'content' | 'landing'
}>(), {
  src: laTapBerneContent.assets.backdrop.src,
  variant: 'content',
})
</script>

<style scoped>
.latap-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.latap-backdrop__image,
.latap-backdrop__wash {
  position: absolute;
  inset: 0;
}

.latap-backdrop__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}

.latap-backdrop__wash {
  background: var(--latap-page-wash, rgb(154 101 0 / 50%));
}

.latap-backdrop--landing {
  --latap-backdrop-landing-rgb: var(--latap-landing-wash-rgb, var(--brand-accent-display-rgb, 154 101 0));
}

.latap-backdrop--landing .latap-backdrop__wash {
  background: linear-gradient(
    180deg,
    rgb(var(--latap-backdrop-landing-rgb) / 48%) 0%,
    rgb(var(--latap-backdrop-landing-rgb) / 26%) 10%,
    rgb(var(--latap-backdrop-landing-rgb) / 10%) 22%,
    rgb(var(--latap-backdrop-landing-rgb) / 0%) 36%,
    rgb(var(--latap-backdrop-landing-rgb) / 0%) 100%
  );
  pointer-events: none;
}
</style>
