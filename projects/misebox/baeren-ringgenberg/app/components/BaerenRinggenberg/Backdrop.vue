<template>
  <div
    class="baeren-backdrop"
    :class="{ 'baeren-backdrop--landing': variant === 'landing' }"
    aria-hidden="true"
  >
    <img
      class="baeren-backdrop__image"
      :src="src"
      alt=""
    >
    <div class="baeren-backdrop__wash" />
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../config/content.config'

withDefaults(defineProps<{
  src?: string
  variant?: 'content' | 'landing'
}>(), {
  src: baerenRinggenbergContent.assets.backdrop.src,
  variant: 'content',
})
</script>

<style scoped>
.baeren-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 45%, rgb(var(--brand-canvas-rgb) / 92%), transparent 36rem),
    linear-gradient(145deg, var(--brand-canvas), color-mix(in srgb, var(--brand-accent) 24%, var(--brand-canvas)));
}

.baeren-backdrop__image,
.baeren-backdrop__wash {
  position: absolute;
  inset: 0;
}

.baeren-backdrop__image {
  inset: 50% auto auto 50%;
  width: min(72vmin, 44rem);
  height: min(72vmin, 44rem);
  opacity: 0.18;
  object-fit: contain;
  transform: translate(-50%, -50%);
}

.baeren-backdrop__wash {
  background: var(--baeren-page-wash, rgb(var(--brand-canvas-rgb) / 68%));
}

:global(.dark) .baeren-backdrop {
  background:
    radial-gradient(circle at 50% 45%, rgb(var(--brand-ink-rgb) / 48%), transparent 36rem),
    linear-gradient(145deg, var(--brand-ink), color-mix(in srgb, var(--brand-primary) 42%, black));
}

:global(.dark) .baeren-backdrop__image {
  filter: invert(1);
  opacity: 0.14;
}

.baeren-backdrop--landing {
  --baeren-backdrop-landing-rgb: var(--baeren-landing-wash-rgb, var(--brand-accent-display-rgb, 154 101 0));
}

.baeren-backdrop--landing .baeren-backdrop__wash {
  background: linear-gradient(
    180deg,
    rgb(var(--baeren-backdrop-landing-rgb) / 48%) 0%,
    rgb(var(--baeren-backdrop-landing-rgb) / 26%) 10%,
    rgb(var(--baeren-backdrop-landing-rgb) / 10%) 22%,
    rgb(var(--baeren-backdrop-landing-rgb) / 0%) 36%,
    rgb(var(--baeren-backdrop-landing-rgb) / 0%) 100%
  );
  pointer-events: none;
}
</style>
