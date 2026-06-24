<template>
  <section class="latap-page">
    <img
      class="latap-page__cover"
      src="/img/gallery/image-1.png"
      :alt="coverAlt"
    >
    <div class="latap-page__wash" />

    <article class="latap-page__panel">
      <p class="latap-page__eyebrow">
        {{ eyebrow }}
      </p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="latap-page__subtitle">
        {{ subtitle }}
      </p>

      <slot />
    </article>

  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
  coverAlt?: string
}>(), {
  subtitle: '',
  eyebrow: 'La Tap Berne',
  coverAlt: 'La Tap Berne terrace food',
})
</script>

<style scoped>
.latap-page {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  color: var(--latap-page-fg, var(--brand-canvas));
}

.latap-page__cover,
.latap-page__wash {
  position: absolute;
  inset: 0;
}

.latap-page__cover {
  z-index: 0;
  display: block;
  width: 100%;
  height: 100svh;
  object-fit: cover;
  object-position: center bottom;
}

.latap-page__wash {
  z-index: 1;
  background: var(--latap-page-wash, rgb(154 101 0 / 50%));
}

.latap-page__panel {
  position: relative;
  z-index: 2;
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.25rem);
  width: min(42rem, calc(100% - 2rem));
  min-height: 100svh;
  align-content: center;
  margin: 0 auto;
  padding: clamp(10rem, 18vw, 13rem) 0 clamp(11rem, 18vw, 13rem);
  text-align: center;
}

.latap-page__eyebrow,
.latap-page__subtitle {
  margin: 0;
}

.latap-page__eyebrow {
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.latap-page__panel h1 {
  margin: 0;
  font-size: clamp(3rem, 8vw, 6.2rem);
  font-weight: 950;
  letter-spacing: -0.08em;
  line-height: 0.88;
}

.latap-page__subtitle {
  color: var(--latap-page-copy-fg, color-mix(in srgb, var(--brand-canvas) 84%, transparent));
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.55;
}

@media (max-width: 720px) {
  .latap-page__panel {
    align-content: start;
    padding-top: 11rem;
    text-align: left;
  }
}
</style>
