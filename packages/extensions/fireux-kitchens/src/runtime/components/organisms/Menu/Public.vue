<template>
  <article class="public-menu" :style="menuDesignStyle">
    <header class="public-menu__hero">
      <p class="public-menu__kicker">
        {{ kitchenName }}
      </p>
      <h1>{{ menu.name }}</h1>
      <p v-if="menu.description" class="public-menu__description">
        {{ menu.description }}
      </p>
    </header>

    <section
      v-for="row in visibleSectionRows"
      :key="row.section.id"
      class="public-menu__section"
    >
      <header>
        <h2>{{ row.section.label }}</h2>
        <p v-if="row.section.description">
          {{ row.section.description }}
        </p>
      </header>

      <ul class="public-menu__items">
        <li
          v-for="item in row.items"
          :key="item.item.id"
          class="public-menu__item"
        >
          <div>
            <h3>{{ item.label }}</h3>
            <p v-if="item.description">
              {{ item.description }}
            </p>
          </div>
          <span
            v-if="item.price > 0"
            class="public-menu__price"
          >
            {{ formatPrice(item.price) }}
          </span>
        </li>
      </ul>
    </section>

    <UAlert
      v-if="!visibleSectionRows.length"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu has no published dish items yet."
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../models/menu.model'
import {
  resolvePublicMenuDesignSource,
  resolvePublicMenuDesignStyle,
} from '../../../composables/fireux/app/public-menu-design'

type PublicMenuSectionRow = {
  section: { id: string; label: string; description?: string }
  items: Array<{
    item: { id: string }
    label: string
    description: string
    price: number
  }>
}

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sectionRows: PublicMenuSectionRow[]
}>()

const visibleSectionRows = computed(() =>
  props.sectionRows.filter((row) => row.items.length > 0)
)
const menuDesignStyle = computed(() =>
  resolvePublicMenuDesignStyle(resolvePublicMenuDesignSource(props.menu))
)

const formatPrice = (price: number) =>
  price > 0
    ? new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(price)
    : ''
</script>

<style scoped>
.public-menu {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 48px 16px 72px;
  color: var(--public-menu-text, var(--ui-text-highlighted));
  font-family: var(--public-menu-font, inherit);
}

.public-menu__hero {
  display: grid;
  gap: 12px;
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu__kicker {
  margin: 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.public-menu__hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 9vw, 5.5rem);
  font-family: var(--public-menu-heading-font, var(--public-menu-font, inherit));
  font-weight: 800;
  line-height: 0.95;
}

.public-menu__description {
  max-width: 680px;
  margin: 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 1rem;
}

.public-menu__section {
  display: grid;
  gap: 14px;
  padding-top: 34px;
}

.public-menu__section header {
  display: grid;
  gap: 4px;
}

.public-menu__section h2 {
  margin: 0;
  font-size: clamp(1.35rem, 4vw, 2.1rem);
  font-weight: 800;
}

.public-menu__section header p {
  margin: 0;
  color: var(--ui-text-muted);
}

.public-menu__items {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu__item h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 750;
}

.public-menu__item p {
  max-width: 680px;
  margin: 6px 0 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 0.94rem;
  line-height: 1.45;
}

.public-menu__price {
  color: var(--public-menu-accent, var(--public-menu-text, var(--ui-text-highlighted)));
  font-size: 0.95rem;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .public-menu {
    padding-top: 28px;
  }

  .public-menu__item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .public-menu__price {
    justify-self: start;
  }
}
</style>
