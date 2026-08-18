<template>
  <section
    class="menu-browse-specials"
    aria-labelledby="menu-browse-specials-title"
  >
    <header class="menu-browse-specials__header">
      <p>Today’s specials</p>
      <h2 id="menu-browse-specials-title" class="fx-type-section-title">
        {{ specials.name }}
      </h2>
      <p v-if="specials.description">{{ specials.description }}</p>
    </header>

    <MenuBrowseCatalogue
      :currency-code="currencyCode"
      :currency-format="currencyFormat"
      :copy="copy"
      :sections="specials.sections"
      :show-currency="showCurrency"
    />
  </section>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import type { MenuManifestContent } from '../../models/menu-detail.model.ts'
import type { MenuBrowseSurfaceCopy } from '../../content/menu-surface-copy'

withDefaults(defineProps<{
  currencyCode: string
  currencyFormat?: CurrencyDisplayFormat
  copy: MenuBrowseSurfaceCopy
  showCurrency?: boolean
  specials: MenuManifestContent
}>(), {
  currencyFormat: 'dash',
  showCurrency: true,
})
</script>

<style scoped>
.menu-browse-specials {
  display: grid;
  gap: calc(var(--spacing) * 6);
  width: min(100%, 68rem);
  margin: 0 auto;
  padding: clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 10));
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 45%, transparent);
  border-radius: calc(var(--ui-radius) * 2);
}

.menu-browse-specials__header p:first-child {
  color: var(--menu-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.menu-browse-specials__header h2 {
  margin-top: calc(var(--spacing) * 1);
}

.menu-browse-specials__header p:last-child {
  margin-top: calc(var(--spacing) * 2);
  color: var(--menu-muted);
}
</style>
