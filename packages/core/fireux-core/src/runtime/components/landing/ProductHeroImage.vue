<template>
  <figure class="landing-product-hero-image" :style="heroStyle">
    <img
      :src="src"
      :alt="alt"
      width="1600"
      height="1000"
      decoding="async"
      fetchpriority="high"
    />
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ src: string; alt: string; position?: string }>(),
  {
    position: 'center',
  }
)
const heroStyle = computed(() => ({
  '--landing-hero-position': props.position,
}))
</script>

<style scoped>
.landing-product-hero-image {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
  box-shadow: var(--shadow-xl);
}

@media (min-width: 1024px) {
  .landing-product-hero-image::before {
    position: absolute;
    z-index: 1;
    inset-block: 0;
    left: 0;
    width: var(--landing-hero-overlap-width, 0);
    backdrop-filter: blur(clamp(8px, 1vw, 14px));
    content: '';
    mask-image: linear-gradient(
      to right,
      black 20%,
      transparent 82%,
      transparent 100%
    );
    pointer-events: none;
  }
}

.landing-product-hero-image img {
  display: block;
  width: 100%;
  max-height: 38rem;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: var(--landing-hero-position);
}
</style>
