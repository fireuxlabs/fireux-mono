<template>
  <main
    class="public-menu"
    :class="{ 'public-menu--preview': variant === 'preview' }"
    :style="menuStyleVars"
  >
    <section class="menu-page">
      <header class="menu-header">
        <p v-if="kitchenName" class="kitchen-name">
          {{ kitchenName }}
        </p>
        <h1>{{ menu.name }}</h1>
        <p v-if="menu.description" class="description">
          {{ menu.description }}
        </p>
      </header>

      <UAlert
        v-if="!sections.length"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This menu has no public sections yet."
      />

      <div v-else class="menu-sections">
        <section
          v-for="section in sections"
          :key="section.id"
          class="menu-section"
        >
          <header class="section-header">
            <h2>{{ section.label }}</h2>
            <p v-if="section.description">
              {{ section.description }}
            </p>
          </header>

          <div v-if="section.items.length" class="menu-items">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="menu-item"
            >
              <div class="item-copy">
                <h3>{{ item.name }}</h3>
                <p v-if="item.description">
                  {{ item.description }}
                </p>
              </div>

              <div v-if="formatPrice(item.price)" class="item-price">
                {{ formatPrice(item.price) }}
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  formatCurrencyAmount,
  type CurrencyDisplayFormat,
} from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenPublicMenuSectionRow } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { KitchenPublicMenuPolish } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sections: KitchenPublicMenuSectionRow[]
  pageStyle?: Partial<PageStyle> | null
  publicMenuPolish?: Partial<KitchenPublicMenuPolish> | null
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  variant?: 'page' | 'preview'
}>()

const color = (value: unknown) => String(value ?? '').trim()

const menuStyleVars = computed(() => {
  const style = props.pageStyle ?? {}
  const polish = props.publicMenuPolish ?? {}
  const vars: Record<string, string> = {}
  const backgroundLight = color(style.background_color_light)
  const backgroundDark = color(style.background_color_dark)
  const fontLight = color(style.font_color_light)
  const fontDark = color(style.font_color_dark)
  const primary = color(style.primary_color)
  const secondary = color(style.secondary_color)
  const contentInsetLeft = color(polish.content_inset_left)

  if (backgroundLight) vars['--menu-bg-light'] = backgroundLight
  if (backgroundDark) vars['--menu-bg-dark'] = backgroundDark
  if (fontDark) vars['--menu-text-dark'] = fontDark
  if (fontLight) vars['--menu-text-light'] = fontLight
  if (primary) vars['--menu-accent'] = primary
  if (secondary) vars['--menu-secondary'] = secondary
  if (contentInsetLeft) vars['--menu-content-inset-left'] = contentInsetLeft

  return vars
})

const formatPrice = (price: number) => {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: props.currencyFormat,
    showCurrency: props.showCurrency,
  })
}
</script>

<style scoped>
.public-menu {
  --menu-bg-light: #fffaf2;
  --menu-bg-dark: #171717;
  --menu-text-light: #211915;
  --menu-text-dark: #f8f1e8;
  --menu-bg: var(--menu-bg-light);
  --menu-text: var(--menu-text-light);
  --menu-muted: color-mix(in srgb, var(--menu-text) 72%, var(--menu-bg));
  --menu-dimmed: color-mix(in srgb, var(--menu-text) 54%, var(--menu-bg));
  --menu-accent: var(--ui-primary);
  --menu-secondary: color-mix(in srgb, var(--menu-accent) 70%, var(--menu-text));
  --menu-font: Georgia, 'Times New Roman', serif;
  --menu-page-padding-block: clamp(1.5rem, 4vw, 3rem);
  --menu-page-padding-inline: clamp(1.5rem, 4vw, 3rem);
  --menu-body-inset-left: 0rem;

  min-height: 100vh;
  background: var(--menu-bg);
  color: var(--menu-text);
  font-family: var(--menu-font);
}

.public-menu--preview {
  min-height: auto;
  border-radius: 1rem;
}

.public-menu--preview .menu-page {
  width: 100%;
  padding: 1rem;
}

.public-menu--preview .menu-header {
  margin-bottom: 1rem;
  text-align: left;
}

.public-menu--preview .kitchen-name {
  letter-spacing: 0.12em;
}

.public-menu--preview .menu-header h1 {
  font-size: 1.2rem;
  letter-spacing: 0.06em;
}

.public-menu--preview .description {
  margin-inline: 0;
  font-size: 0.85rem;
}

.public-menu--preview .menu-sections {
  gap: 1rem;
}

.public-menu--preview .section-header {
  text-align: left;
}

.public-menu--preview .section-header h2 {
  font-size: 0.95rem;
  letter-spacing: 0.06em;
}

.public-menu--preview .menu-items {
  gap: 0.35rem;
}

.public-menu--preview .menu-item {
  padding-block: 0.55rem;
}

.menu-page {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: var(--menu-page-padding-block) var(--menu-page-padding-inline);
}

@media (min-width: 768px) {
  .menu-sections {
    padding-left: var(--menu-content-inset-left, var(--menu-body-inset-left));
  }
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.kitchen-name,
.description {
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.kitchen-name {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--menu-secondary);
}

.menu-header h1 {
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--menu-accent);
}

.description {
  margin: 0.75rem auto 0;
  max-width: 42rem;
  line-height: 1.55;
  color: var(--menu-muted);
}

.menu-sections {
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
}

.menu-section {
  display: grid;
  gap: 1rem;
}

.section-header {
  text-align: center;
}

.section-header h2 {
  margin: 0;
  font-size: clamp(1.35rem, 4vw, 2rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--menu-text);
}

.section-header p {
  margin: 0.5rem auto 0;
  max-width: 36rem;
  color: var(--menu-muted);
}

.menu-items {
  display: grid;
  gap: 0.9rem;
}

.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-block: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-secondary) 24%, transparent);
}

.item-copy h3 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.3;
  color: var(--menu-text);
}

.item-copy p {
  margin: 0.3rem 0 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--menu-muted);
}

.item-price {
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 700;
  color: var(--menu-accent);
}

@media (max-width: 520px) {
  .menu-item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}

@media (prefers-color-scheme: dark) {
  .public-menu {
    --menu-bg: var(--menu-bg-dark);
    --menu-text: var(--menu-text-dark);
  }
}
</style>
