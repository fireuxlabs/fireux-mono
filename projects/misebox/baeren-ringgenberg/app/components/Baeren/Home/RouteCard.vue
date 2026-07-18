<template>
  <NuxtLink
    :to="surface.to"
    class="baeren-home-route-card"
    :class="{ 'baeren-home-route-card--featured': surface.featured }"
    :data-route="surface.key"
    :aria-labelledby="titleId"
  >
    <span class="baeren-home-route-card__icon">
      <UIcon :name="surface.icon" aria-hidden="true" />
    </span>

    <span class="baeren-home-route-card__body">
      <span class="baeren-home-route-card__eyebrow">{{ surface.label }}</span>
      <strong :id="titleId" class="baeren-home-route-card__title">{{ surface.title }}</strong>
      <span class="baeren-home-route-card__copy">{{ surface.copy }}</span>

      <span v-if="surface.facts?.length" class="baeren-home-route-card__facts">
        <span v-for="fact in surface.facts" :key="fact">{{ fact }}</span>
      </span>
    </span>

    <UIcon class="baeren-home-route-card__arrow" name="i-lucide-arrow-up-right" aria-hidden="true" />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { BaerenHomeRoute } from '../../../config/content.config'

const props = defineProps<{
  surface: BaerenHomeRoute
}>()

const titleId = `baeren-home-route-${props.surface.key}`
</script>

<style scoped>
.baeren-home-route-card {
  display: grid;
  min-width: 0;
  min-height: 5rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--baeren-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: rgb(var(--baeren-surface-rgb) / 92%);
  color: var(--baeren-ink);
  box-shadow: 0 0.7rem 1.8rem rgb(var(--baeren-card-shadow-rgb) / 8%);
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.baeren-home-route-card--featured {
  min-height: 10.5rem;
  padding: 1.2rem;
  background: var(--baeren-forest-raised);
  color: var(--baeren-on-dark);
  border-color: transparent;
}

.baeren-home-route-card[data-route='menu'] {
  background: var(--baeren-accent);
}

.baeren-home-route-card[data-route='events'] {
  background: var(--baeren-event);
  color: var(--baeren-event-ink);
}

.baeren-home-route-card__icon {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: calc(var(--ui-radius) * 3);
  font-size: 1.2rem;
  opacity: 0.82;
}

.baeren-home-route-card__body {
  display: grid;
  min-width: 0;
  gap: 0.35rem;
}

.baeren-home-route-card__eyebrow {
  color: inherit;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  opacity: 0.66;
  text-transform: uppercase;
}

.baeren-home-route-card__title {
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.baeren-home-route-card__copy {
  display: none;
  color: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.76;
}

.baeren-home-route-card--featured .baeren-home-route-card__copy {
  display: inline;
}

.baeren-home-route-card__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-top: 0.35rem;
}

.baeren-home-route-card__facts > span {
  padding: 0.3rem 0.55rem;
  border: 1px solid currentColor;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 850;
  opacity: 0.75;
}

.baeren-home-route-card__arrow {
  margin-top: 0.2rem;
  font-size: 1.1rem;
  opacity: 0.62;
}

@media (min-width: 40rem) {
  .baeren-home-route-card {
    min-height: 13rem;
    grid-template-columns: 1fr auto;
    align-content: start;
    gap: 1rem;
    padding: 1.35rem;
    border-radius: calc(var(--ui-radius) * 6);
  }

  .baeren-home-route-card__icon {
    grid-column: 1;
  }

  .baeren-home-route-card__body {
    grid-column: 1 / -1;
  }

  .baeren-home-route-card__arrow {
    grid-column: 2;
    grid-row: 1;
  }

  .baeren-home-route-card__title {
    font-size: 1.35rem;
  }

  .baeren-home-route-card__copy {
    display: inline;
  }
}

@media (hover: hover) and (pointer: fine) {
  .baeren-home-route-card:hover {
    border-color: var(--baeren-border-hover);
    box-shadow: 0 1rem 2.5rem rgb(var(--baeren-card-shadow-rgb) / 14%);
    transform: translateY(-3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .baeren-home-route-card {
    transition: none;
  }
}
</style>
