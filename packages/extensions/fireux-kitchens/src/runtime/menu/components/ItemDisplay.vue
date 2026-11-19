<template>
  <component
    :is="as || 'article'"
    class="menu-browse-item"
    :aria-labelledby="nameId"
  >
    <MenuItemImage v-if="imageUrl" enabled :image-url="imageUrl" />
    <div class="menu-browse-item__copy">
      <div class="menu-browse-item__heading">
        <component
          :is="headingTag || 'h3'"
          :id="nameId"
          class="menu-browse-item__name"
        >
          <NuxtLink v-if="nameTo" :to="nameTo">{{ name }}</NuxtLink>
          <template v-else>{{ name }}</template>
        </component>
        <span
          v-if="price"
          class="menu-browse-item__price"
          :aria-live="announcePrice ? 'polite' : undefined"
          :aria-atomic="announcePrice ? 'true' : undefined"
          >{{ price }}</span
        >
      </div>
      <p v-if="promotionLabel">{{ promotionLabel }}</p>
      <p v-if="description" class="menu-browse-item__description">
        {{ description }}
      </p>
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  as?: 'article' | 'div'
  headingTag?: 'h3' | 'h4'
  nameId?: string
  nameTo?: RouteLocationRaw
  name: string
  price?: string
  announcePrice?: boolean
  description?: string
  promotionLabel?: string
  imageUrl?: string
}>()
</script>

<style scoped>
.menu-browse-item__price,
.menu-browse-item__description {
  font-family: var(
    --menu-font,
    var(--font-sans, ui-sans-serif, system-ui, sans-serif)
  );
}

.menu-browse-item__name {
  min-width: 0;
  margin: 0;
  color: var(--menu-title, var(--ui-text-highlighted));
  font-family: var(
    --menu-title-font,
    var(--font-sans, ui-sans-serif, system-ui, sans-serif)
  );
  font-size: 1.075rem;
  font-weight: var(--font-weight-extrabold);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.menu-browse-item__price {
  color: var(--menu-primary, var(--ui-text-highlighted));
  font-size: 0.92rem;
  font-weight: var(--font-weight-extrabold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-browse-item__description {
  margin: 0.45rem 0 0;
  color: var(--menu-muted, var(--ui-text-muted));
  font-size: 0.9rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-line;
}
.menu-browse-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5) 0;
  border-bottom: 1px solid
    color-mix(in srgb, var(--menu-text, var(--ui-text)) 12%, transparent);
}

.menu-browse-item:has(> .menu-item-image) {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.menu-browse-item__copy {
  min-width: 0;
}

.menu-browse-item__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: calc(var(--spacing) * 4);
  align-items: baseline;
}

@media (max-width: 520px) {
  .menu-browse-item:has(> .menu-item-image) {
    grid-template-columns: 4rem minmax(0, 1fr);
  }

  .menu-browse-item {
    --menu-item-image-size: 4rem;
  }
}

@media (max-width: 420px) {
  .menu-browse-item:has(> .menu-item-image) .menu-browse-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing);
  }

  .menu-browse-item:has(> .menu-item-image) .menu-browse-item__price {
    justify-self: start;
  }
}

@media (max-width: 340px) {
  .menu-browse-item__heading {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.15rem;
  }

  .menu-browse-item__price {
    justify-self: start;
  }
}
</style>
