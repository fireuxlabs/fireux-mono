<template>
  <article class="latap-hero">
    <p class="latap-hero__eyebrow">
      {{ eyebrow }}
    </p>
    <h1>{{ title }}</h1>
    <p v-if="subtitle" class="latap-hero__subtitle">
      {{ subtitle }}
    </p>

    <slot />
  </article>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../../config/content.config'

withDefaults(defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>(), {
  subtitle: '',
  eyebrow: laTapBerneContent.brand.name,
})
</script>

<style scoped>
.latap-hero {
  position: relative;
  z-index: 1;
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.25rem);
  width: min(42rem, calc(100% - 2rem));
  min-height: 100svh;
  align-content: center;
  margin: 0 auto;
  padding: clamp(10rem, 18vw, 13rem) 0 clamp(11rem, 18vw, 13rem);
  text-align: center;
}

.latap-hero__eyebrow,
.latap-hero__subtitle {
  margin: 0;
}

.latap-hero__eyebrow {
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.latap-hero h1 {
  margin: 0;
  font-size: clamp(3rem, 8vw, 6.2rem);
  font-weight: 950;
  letter-spacing: -0.08em;
  line-height: 0.88;
}

.latap-hero__subtitle {
  color: var(--latap-page-copy-fg, color-mix(in srgb, var(--brand-canvas) 84%, transparent));
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.55;
}

@media (max-width: 720px) {
  .latap-hero {
    align-content: start;
    padding-top: 11rem;
    text-align: left;
  }
}
</style>
