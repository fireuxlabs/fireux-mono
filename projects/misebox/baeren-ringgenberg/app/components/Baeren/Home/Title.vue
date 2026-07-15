<template>
  <header class="baeren-home-title">
    <p class="baeren-home-title__eyebrow">{{ home.eyebrow }}</p>
    <h1 id="baeren-home-title">
      <span v-for="line in home.titleLines" :key="line">{{ line }}</span>
    </h1>
    <p class="baeren-home-title__subtitle">{{ home.subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../../config/content.config'

defineOptions({ name: 'BaerenHomeTitle' })

const home = baerenRinggenbergContent.pages.home
</script>

<style scoped>
.baeren-home-title {
  display: grid;
  gap: 0.7rem;
  max-width: 52rem;
}

.baeren-home-title__eyebrow,
.baeren-home-title__subtitle,
.baeren-home-title h1 {
  margin: 0;
}

.baeren-home-title__eyebrow {
  color: rgb(var(--baeren-on-dark-rgb) / 72%);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.baeren-home-title h1 {
  display: flex;
  flex-direction: column;
  color: var(--baeren-on-dark);
  font-size: clamp(2.15rem, 10.8vw, 3rem);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.baeren-home-title__subtitle {
  max-width: 31rem;
  color: rgb(var(--baeren-on-dark-rgb) / 86%);
  font-size: clamp(0.98rem, 4.6vw, 1.15rem);
  font-weight: 650;
  line-height: 1.4;
}

@media (min-width: 56rem) {
  .baeren-home-title {
    gap: 0.9rem;
  }

  .baeren-home-title h1 {
    font-size: clamp(4rem, 6.4vw, 5.5rem);
    line-height: 0.88;
    text-shadow: 0 0.25rem 2rem rgb(0 0 0 / 46%);
  }

  .baeren-home-title__subtitle {
    font-size: 1.3rem;
    text-shadow: 0 0.2rem 1rem rgb(0 0 0 / 56%);
  }
}
</style>
