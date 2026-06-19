<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :render-menu="renderMenu"
  >
    <MenuPublicShell :page-style="renderMenu?.pageStyle">
      <section class="menu-surface">
        <p v-if="pending" class="menu-state">
          Loading menu...
        </p>

        <p v-else-if="error" class="menu-state">
          Menu unavailable.
        </p>

        <article v-else-if="renderMenu" class="menu">
          <header class="menu__header">
            <p v-if="renderMenu.kitchenName" class="menu__eyebrow">
              {{ renderMenu.kitchenName }}
            </p>
            <h1>{{ renderMenu.name }}</h1>
            <p v-if="renderMenu.description" class="menu__description">
              {{ renderMenu.description }}
            </p>
          </header>

          <div class="menu__sections">
            <section
              v-for="section in renderMenu.sections"
              :key="section.id"
              class="menu__section"
            >
              <h2>{{ section.label }}</h2>

              <article
                v-for="item in section.items"
                :key="item.id"
                class="menu__item"
              >
                <div class="menu__item-copy">
                  <h3>{{ item.name }}</h3>
                  <p v-if="item.description">
                    {{ item.description }}
                  </p>
                </div>
                <p v-if="item.priceLabel" class="menu__price">
                  {{ item.priceLabel }}
                </p>
              </article>
            </section>
          </div>
        </article>

        <p v-else class="menu-state">
          Menu unavailable.
        </p>

        <details class="menu-debug">
          <summary>Menu debug</summary>
          <pre>{{ debug }}</pre>
        </details>
      </section>
    </MenuPublicShell>
  </slot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuManifest } from '../composables/fireux/public/menu/useMenuManifest'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
const {
  menu,
  pending,
  error,
  renderMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
</script>

<style scoped>
.menu-surface {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: 100svh;
  padding: clamp(4.5rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem) clamp(5rem, 8vw, 7rem);
  color: var(--menu-text);
  text-align: center;
}

.menu,
.menu__header,
.menu__sections,
.menu__section,
.menu__item-copy {
  display: grid;
}

.menu {
  gap: clamp(2rem, 4vw, 3rem);
}

.menu__header {
  gap: 0.75rem;
  justify-items: center;
}

.menu__eyebrow {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu__header h1 {
  max-width: 11ch;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}

.menu__description,
.menu-state {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.menu__sections {
  gap: 2rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

.menu__section {
  gap: 0.7rem;
  align-content: start;
}

.menu__section h2 {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.menu__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.menu__item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.menu__item-copy {
  gap: 0.2rem;
}

.menu__item h3,
.menu__item p {
  margin: 0;
}

.menu__item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.menu__item-copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.menu__price {
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.menu-debug {
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

.menu-debug pre {
  overflow: auto;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: 0.75rem;
  font-size: 0.8rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

@media (min-width: 920px) {
  .menu__sections {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 4vw, 4rem);
  }

  .menu__section {
    break-inside: avoid;
    margin-bottom: 2rem;
  }
}
</style>
