<template>
  <article class="template-one-dish-card" :class="{ 'template-one-dish-card--featured': featured }">
    <div class="template-one-dish-card__copy">
      <p v-if="eyebrow" class="template-one-dish-card__eyebrow">{{ eyebrow }}</p>
      <h3>{{ item.name }}</h3>
      <p>{{ item.description }}</p>
    </div>
    <img :src="item.imageUrl" :alt="item.name" loading="lazy" decoding="async">
  </article>
</template>

<script setup lang="ts">
import type { MenuManifestItem } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

withDefaults(defineProps<{
  item: MenuManifestItem
  eyebrow?: string
  featured?: boolean
}>(), {
  eyebrow: '',
  featured: false,
})
</script>

<style scoped>
.template-one-dish-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(8rem, 0.8fr) minmax(10rem, 1.2fr);
  align-items: center;
  min-height: clamp(11rem, 25vw, 18rem);
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--template-one-accent) 42%, transparent);
}

.template-one-dish-card__copy { z-index: 1; padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 10)) 0; }
.template-one-dish-card h3 { display: flex; gap: 0.65rem; align-items: center; margin: 0; color: var(--template-one-text); font: 700 clamp(1.6rem, 4vw, 3rem)/0.9 var(--template-one-display-family); text-transform: uppercase; }
.template-one-dish-card p { max-width: 18rem; margin: 0.55rem 0 0; color: var(--template-one-muted); font: 700 clamp(0.68rem, 1.3vw, 0.9rem)/1.25 var(--template-one-body-family); letter-spacing: 0.06em; text-transform: uppercase; }
.template-one-dish-card__eyebrow { color: var(--template-one-accent) !important; }
.template-one-dish-card img { width: 118%; max-height: 18rem; object-fit: contain; filter: drop-shadow(0 1.1rem 0.8rem rgb(0 0 0 / 45%)); transform: translateX(-5%); }
.template-one-dish-card--featured { grid-column: 1 / -1; grid-template-columns: minmax(12rem, 0.7fr) minmax(18rem, 1.3fr); min-height: clamp(14rem, 28vw, 21rem); border: 1px solid color-mix(in srgb, var(--template-one-accent) 55%, transparent); padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 8)); }

@media (max-width: 42rem) {
  .template-one-dish-card { grid-template-columns: minmax(7rem, 0.8fr) minmax(10rem, 1.2fr); min-height: 9.5rem; }
  .template-one-dish-card img { width: 125%; }
  .template-one-dish-card--featured { grid-template-columns: 0.85fr 1.15fr; min-height: 12rem; }
}
</style>
