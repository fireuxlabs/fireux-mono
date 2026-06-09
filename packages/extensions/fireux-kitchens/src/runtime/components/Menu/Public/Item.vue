<template>
  <article class="menu-item">
    <div class="item-copy">
      <h3>{{ item.name }}</h3>
      <p v-if="item.description">
        {{ item.description }}
      </p>
    </div>

    <div v-if="priceLabel" class="item-price">
      {{ priceLabel }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import { formatKitchenPublicMenuItemPrice } from '../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuPrice'
import type { KitchenPublicMenuItemRow } from '../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

const props = defineProps<{
  item: KitchenPublicMenuItemRow
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
}>()

const priceLabel = computed(() =>
  formatKitchenPublicMenuItemPrice(props.item, {
    currencyCode: props.currencyCode,
    currencyFormat: props.currencyFormat,
    showCurrency: props.showCurrency,
  })
)
</script>

<style scoped>
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
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--menu-muted);
}

.item-price {
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 600;
  color: var(--menu-text);
}
</style>
