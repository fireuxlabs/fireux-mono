<template>
  <section class="menu-section">
    <header class="section-header">
      <h2>{{ section.label }}</h2>
      <p v-if="section.description">
        {{ section.description }}
      </p>
    </header>

    <div v-if="section.items.length" class="menu-items">
      <MenuPreviewItem
        v-for="item in section.items"
        :key="item.id"
        :item="item"
        :currency-code="currencyCode"
        :currency-format="currencyFormat"
        :show-currency="showCurrency"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { KitchenPublicMenuSectionRow } from '../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

defineProps<{
  section: KitchenPublicMenuSectionRow
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
}>()
</script>

<style scoped>
.menu-section {
  display: grid;
  gap: 1rem;
}

.section-header {
  text-align: center;
}

.section-header h2 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.65rem);
  letter-spacing: 0;
  color: var(--menu-title);
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

@media (min-width: 920px) {
  .menu-section {
    break-inside: avoid;
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
}
</style>
