<template>
  <div class="latap-menu" aria-label="Menu sections">
    <section
      v-for="section in menuSections"
      :key="section.label"
      class="latap-menu__section"
    >
      <h2>{{ section.label }}</h2>

      <article
        v-for="item in section.items"
        :key="item.name"
        class="latap-menu__item"
      >
        <div class="latap-menu__copy">
          <h3>{{ item.name }}</h3>
          <p v-if="item.description">
            {{ item.description }}
          </p>
        </div>
        <p class="latap-menu__price">
          {{ item.price }}
        </p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { laTapBerneMenuSections } from '../../menu'

const menuSections = laTapBerneMenuSections
</script>

<style scoped>
.latap-menu {
  display: grid;
  gap: 2rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

.latap-menu__section {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.latap-menu__section h2 {
  margin: 0;
  color: var(--brand-primary);
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.latap-menu__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-ink) 18%, transparent);
}

.latap-menu__item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.latap-menu__copy {
  display: grid;
  gap: 0.2rem;
}

.latap-menu__item h3,
.latap-menu__item p {
  margin: 0;
}

.latap-menu__item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.latap-menu__copy p {
  color: color-mix(in srgb, var(--brand-ink) 72%, transparent);
  font-size: 0.9rem;
  line-height: 1.35;
}

.latap-menu__price {
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

@media (min-width: 920px) {
  .latap-menu {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 4vw, 4rem);
  }

  .latap-menu__section {
    break-inside: avoid;
    margin-bottom: 2rem;
  }
}
</style>
