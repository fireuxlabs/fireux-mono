<template>
  <section
    class="menu-browse-unavailable"
    data-menu-state="unavailable"
    aria-labelledby="menu-browse-unavailable-title"
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
    <NuxtLink
      v-if="indexPath"
      :to="indexPath"
      class="menu-browse-unavailable__link"
    >
      Back to menus
      <span aria-hidden="true">→</span>
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { MenuLoadFailure } from '../../../composables/fireux/menu/useMenu'

defineProps<{
  failure: MenuLoadFailure
  indexPath: string
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
  color: var(--menu-secondary);
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

.menu-browse-unavailable__link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  font-weight: 800;
  text-decoration: none;
}

.menu-browse-unavailable__link:hover {
  filter: brightness(1.08);
}

.menu-browse-unavailable__link:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: 3px;
}
</style>
