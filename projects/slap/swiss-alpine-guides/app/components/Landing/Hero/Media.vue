<template>
  <picture>
    <source srcset="/img/landing/ascent-poster.avif" type="image/avif" />
    <img
      class="alpine-scene__poster"
      src="/img/landing/ascent-poster.webp"
      alt="Snow-covered Alpine summits in soft morning light"
      width="864"
      height="1536"
      fetchpriority="high"
      decoding="async"
    />
  </picture>
  <video
    ref="video"
    class="alpine-scene__video"
    :class="{ 'alpine-scene__video--active': active }"
    muted
    playsinline
    preload="metadata"
    disablepictureinpicture
    tabindex="-1"
    aria-hidden="true"
    width="720"
    height="1280"
  >
    <source src="/img/landing/ascent-scroll.mp4" type="video/mp4" />
  </video>
  <div class="alpine-scene__shade" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ active: boolean }>()
const video = ref<HTMLVideoElement | null>(null)
defineExpose({ video })
</script>

<style scoped>
.alpine-scene__poster,
.alpine-scene__video {
  position: absolute;
  top: calc(var(--scene-viewport) * 0.04 - var(--scene-media-height) * 0.368);
  left: calc((100% - var(--scene-media-height) * 0.5625) * 0.75);
  width: calc(var(--scene-media-height) * 0.5625);
  height: var(--scene-media-height);
  max-width: none;
  object-fit: cover;
  object-position: 75% 50%;
  pointer-events: none;
}
.alpine-scene__video {
  opacity: 0;
}
.alpine-scene__video--active {
  opacity: 1;
}
.alpine-scene__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      #102d4266 0%,
      #17334918 42%,
      #06253700 62%,
      #07233470 100%
    ),
    linear-gradient(90deg, #0b263d25, transparent 80%);
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .alpine-scene__video {
    display: none;
  }
  .alpine-scene__shade {
    bottom: auto;
    height: var(--scene-viewport);
  }
}
</style>
