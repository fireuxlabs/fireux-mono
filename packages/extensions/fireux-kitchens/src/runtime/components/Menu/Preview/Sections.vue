<template>
  <div class="menu-sections">
    <MenuPreviewSection
      v-for="section in sections"
      :key="section.id"
      :section="section"
      :currency-code="currencyCode"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { KitchenPublicMenuSectionRow } from '../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

defineProps<{
  sections: KitchenPublicMenuSectionRow[]
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
}>()
</script>

<style scoped>
.menu-sections {
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
}

@media (min-width: 920px) {
  .menu-sections {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 5vw, 5rem);
  }
}
</style>
