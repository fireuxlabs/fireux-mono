<template>
  <section
    class="menu-browse-unavailable"
    data-menu-state="unavailable"
    aria-labelledby="menu-browse-unavailable-title"
    role="alert"
  >
    <p class="menu-browse-unavailable__status">
      Error {{ failure.statusCode }}
    </p>
    <h1 id="menu-browse-unavailable-title">
      {{ failure.title }}
    </h1>
    <p class="menu-browse-unavailable__description">
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
.menu-browse-unavailable {
  display: grid;
  min-height: min(34rem, 72vh);
  place-content: center;
  justify-items: center;
  gap: 1rem;
  width: min(100%, 38rem);
  margin: auto;
  text-align: center;
}

.menu-browse-unavailable p,
.menu-browse-unavailable h1 {
  margin: 0;
}

.menu-browse-unavailable__status {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.menu-browse-unavailable h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.2rem, 8vw, 4.5rem);
  letter-spacing: -0.04em;
  line-height: 1;
}

.menu-browse-unavailable__description {
  max-width: 34rem;
  color: var(--menu-muted);
  line-height: 1.6;
}

</style>
