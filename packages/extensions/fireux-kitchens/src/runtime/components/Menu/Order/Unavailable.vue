<template>
  <section
    class="menu-order-unavailable"
    aria-labelledby="menu-order-unavailable-title"
    role="alert"
  >
    <p class="menu-order-unavailable__status">
      Error {{ failure.statusCode }}
    </p>
    <h1 id="menu-order-unavailable-title">
      {{ failure.title }}
    </h1>
    <p class="menu-order-unavailable__description">
      {{ failure.description }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { MenuLoadFailure } from '../../../composables/fireux/menu/useMenu'

defineProps<{
  failure: MenuLoadFailure
}>()
</script>

<style scoped>
.menu-order-unavailable {
  display: grid;
  min-height: min(34rem, 72vh);
  place-content: center;
  justify-items: center;
  gap: 1rem;
  width: min(100%, 38rem);
  margin: auto;
  text-align: center;
}

.menu-order-unavailable p,
.menu-order-unavailable h1 {
  margin: 0;
}

.menu-order-unavailable__status {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-order-unavailable h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.2rem, 8vw, 4.5rem);
  letter-spacing: -0.04em;
  line-height: 1;
}

.menu-order-unavailable__description {
  max-width: 42rem;
  color: var(--menu-muted);
  line-height: 1.6;
}
</style>
